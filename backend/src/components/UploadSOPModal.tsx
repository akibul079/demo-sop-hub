
import React, { useState, useCallback, useRef } from 'react';
import {
  X, Upload, FileText, CheckCircle, AlertCircle,
  Loader2, ArrowRight, Trash2, File, GripVertical
} from 'lucide-react';
import OpenAI from 'openai';
import { Modal } from './ui/Modal';
import { Folder, SOPStatus } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface UploadSOPModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  workspaceId: string;
  onConfirm: (data: any) => Promise<void>;
}

type UploadStep = 'DROP' | 'PROCESSING' | 'REVIEW';

interface FileUploadState {
  id: string;
  file: File;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR';
  progress: number;
  extractedData?: {
    title: string;
    description: string;
    steps: { title: string, description: string, order: number }[];
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    estimatedTime?: string;
  };
  error?: string;
}

const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/zip': 'ZIP',
  'text/plain': 'TXT'
};

const MAX_SIZE = 5 * 1024 * 1024; // Increased to 5MB for PDFs

export const UploadSOPModal: React.FC<UploadSOPModalProps> = ({
  isOpen, onClose, folders, onConfirm
}) => {
  const [step, setStep] = useState<UploadStep>('DROP');
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [targetFolderId, setTargetFolderId] = useState<string>('');

  // Review Form State
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDesc, setReviewDesc] = useState('');
  const [reviewSteps, setReviewSteps] = useState<{ title: string, description: string, order: number }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Reset on Open ---
  React.useEffect(() => {
    if (isOpen) {
      setStep('DROP');
      setFiles([]);
      setActiveReviewIndex(0);
      setTargetFolderId('');
    }
  }, [isOpen]);

  // --- Handlers ---

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: FileUploadState[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'PENDING',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setStep('PROCESSING');
    processFiles(newFiles);
  };

  const extractText = async (file: File): Promise<string> => {
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        const numPages = pdf.numPages;
        for (let i = 1; i <= numPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n`;
          } catch (pageErr) {
            console.warn(`Error extraction page ${i}`, pageErr);
          }
        }
        return fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } else {
        return await file.text();
      }
    } catch (e) {
      console.error("Extraction error", e);
      throw new Error(`Failed to extract text: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const processFiles = async (uploadFiles: FileUploadState[]) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setFiles(prev => prev.map(f => ({ ...f, status: 'ERROR', error: 'Missing VITE_OPENAI_API_KEY in .env.local' })));
      return;
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    for (const fileState of uploadFiles) {
      // PROCESSING
      setFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'PROCESSING', progress: 10 } : f));

      try {
        // Validation
        if (fileState.file.size > MAX_SIZE) throw new Error('File exceeds 5MB limit');

        // Extract Text
        setFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, progress: 30 } : f));
        const text = await extractText(fileState.file);

        if (!text || text.length < 50) {
          throw new Error("Could not extract enough text from file. Is it scanned?");
        }

        // Send to AI
        setFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, progress: 60 } : f));

        const prompt = `
          You are an expert Standard Operating Procedure (SOP) analyst. 
          Your task is to extract structured actionable data from the provided document text.
          
          Analyze the text and identify:
          1. The clear Title of the procedure.
          2. A short, concise Description/Goal.
          3. The sequential Steps involved.
          4. The Difficulty Level (BEGINNER, INTERMEDIATE, ADVANCED).
          5. Estimated time to complete (e.g., "15 mins", "1 hour").

          Return ONLY a valid JSON object with this EXACT structure:
          {
            "title": "SOP Title",
            "description": "Brief summary",
            "steps": [
              { "title": "Step Title", "description": "Detailed step instructions", "order": 0 }
            ],
            "difficulty": "BEGINNER", 
            "estimatedTime": "30 mins"
          }
          
          Rules:
          - If the text is messy, infer the most logical structure.
          - If no clear steps exist, summarize the content into logical sections as steps.
          - Use meaningful step titles.
          - Do not include markdown formatting (like **bold**) in the JSON keys, only in values if necessary.
          
          TEXT CONTENT:
          ${text.substring(0, 30000)}
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that parses documents into JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });

        const rawText = response.choices[0].message.content || "{}";

        const extractedData = JSON.parse(rawText);

        // Ensure steps have IDs
        if (extractedData.steps && Array.isArray(extractedData.steps)) {
          extractedData.steps = extractedData.steps.map((s: any) => ({
            ...s,
            id: s.id || `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }));
        }

        setFiles(prev => prev.map(f => f.id === fileState.id ? {
          ...f,
          status: 'READY',
          progress: 100,
          extractedData: extractedData
        } : f));

      } catch (err: any) {
        console.error("Processing error", err);
        setFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'ERROR', error: err.message, progress: 0 } : f));
      }
    }
  };

  const startReview = () => {
    const readyFiles = files.filter(f => f.status === 'READY');
    if (readyFiles.length === 0) return;
    const first = readyFiles[0];
    setReviewTitle(first.extractedData?.title || '');
    setReviewDesc(first.extractedData?.description || '');
    setReviewSteps(first.extractedData?.steps || []);
    setStep('REVIEW');
    setActiveReviewIndex(0);
  };

  const handleSaveCurrentAndNext = async () => {
    const currentFile = files.filter(f => f.status === 'READY')[activeReviewIndex];
    if (!currentFile) return;

    // Construct SOP Payload
    const sopData = {
      title: reviewTitle,
      shortDescription: reviewDesc,
      steps: reviewSteps.map(step => ({
        ...step,
        // Use Tiptap-compatible HTML string
        description: `<p>${step.description || ''}</p>`
      })),
      folderIds: targetFolderId ? [targetFolderId] : [],
      status: SOPStatus.DRAFT,
      originalFileName: currentFile.file.name
    };

    await onConfirm(sopData);

    const readyFiles = files.filter(f => f.status === 'READY');
    if (activeReviewIndex < readyFiles.length - 1) {
      const nextIndex = activeReviewIndex + 1;
      const nextFile = readyFiles[nextIndex];
      setActiveReviewIndex(nextIndex);
      setReviewTitle(nextFile.extractedData?.title || '');
      setReviewDesc(nextFile.extractedData?.description || '');
      setReviewSteps(nextFile.extractedData?.steps || []);
    } else {
      onClose();
    }
  };

  const renderDropZone = () => (
    <div className="space-y-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-monday-border hover:border-monday-primary hover:bg-blue-50/50 rounded-xl p-10 text-center cursor-pointer transition-all group animate-fadeIn"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-16 h-16 bg-blue-50 text-monday-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload size={32} />
        </div>
        <h3 className="text-lg font-bold text-monday-dark mb-1">Drag & drop SOP documents</h3>
        <p className="text-gray-500 text-sm mb-4">AI will extract steps automatically</p>
        <div className="flex justify-center gap-2">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">PDF</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">DOCX</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">TXT</span>
        </div>
        <p className="text-xs text-gray-400 mt-4">Max file size: 5MB</p>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-monday-dark">Processing {files.length} files</h3>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {files.map(file => (
          <div key={file.id} className={`p-4 rounded-lg border ${file.status === 'ERROR' ? 'bg-red-50 border-red-100' : 'bg-white border-monday-border'} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${file.status === 'ERROR' ? 'bg-white text-red-500' : 'bg-blue-50 text-monday-primary'}`}>
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium text-monday-dark truncate">{file.file.name}</p>
              </div>
              {file.status === 'PENDING' && <div className="h-1.5 w-full bg-gray-100 rounded-full"><div className="h-full bg-gray-300 rounded-full w-0"></div></div>}
              {file.status === 'PROCESSING' && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-monday-primary rounded-full transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-monday-primary flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> {file.progress < 50 ? 'Extracting text...' : 'AI Analyzing...'}</p>
                </div>
              )}
              {file.status === 'READY' && <div className="flex items-center gap-1.5 text-xs text-monday-green font-medium"><CheckCircle size={12} /> Optimization Complete</div>}
              {file.status === 'ERROR' && <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium"><AlertCircle size={12} /> {file.error}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t border-monday-border">
        <button onClick={() => setStep('DROP')} className="mr-auto text-sm text-gray-500">Cancel</button>
        <button
          disabled={!files.some(f => f.status === 'READY')}
          onClick={startReview}
          className="bg-monday-primary text-white px-6 py-2 rounded-md hover:bg-monday-primaryHover disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          Review Result <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderReview = () => {
    const readyFiles = files.filter(f => f.status === 'READY');
    const currentFile = readyFiles[activeReviewIndex];
    if (!currentFile) return null;

    return (
      <div className="flex flex-col h-[600px] animate-fadeIn">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <span className="font-bold text-lg text-monday-dark">Review AI Result</span>
          <span className="text-xs text-gray-500">{activeReviewIndex + 1} of {readyFiles.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-monday-dark">Title</label>
            <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="w-full p-2 border border-monday-border rounded bg-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-monday-dark">Description</label>
            <textarea value={reviewDesc} onChange={(e) => setReviewDesc(e.target.value)} className="w-full p-2 border border-monday-border rounded bg-white h-20 resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-monday-dark">Folder</label>
            <select value={targetFolderId} onChange={(e) => setTargetFolderId(e.target.value)} className="w-full p-2 border border-monday-border rounded bg-white">
              <option value="">Select a folder...</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-monday-dark">Extracted Steps</label>
            {reviewSteps.map((step, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500">Step {idx + 1}</span>
                  <button onClick={() => setReviewSteps(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
                <input value={step.title} onChange={(e) => { const n = [...reviewSteps]; n[idx].title = e.target.value; setReviewSteps(n); }} className="w-full mb-2 p-1 border border-gray-200 rounded text-sm font-medium" />
                <textarea value={step.description} onChange={(e) => { const n = [...reviewSteps]; n[idx].description = e.target.value; setReviewSteps(n); }} className="w-full p-1 border border-gray-200 rounded text-xs h-16 resize-none" />
              </div>
            ))}
            <button onClick={() => setReviewSteps([...reviewSteps, { title: 'New Step', description: '', order: reviewSteps.length }])} className="w-full py-2 border border-dashed text-gray-500 text-sm hover:bg-gray-50">+ Add Step</button>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-monday-border flex justify-end gap-2">
          <button onClick={handleSaveCurrentAndNext} className="bg-monday-primary text-white px-4 py-2 rounded">
            {activeReviewIndex < readyFiles.length - 1 ? 'Save & Next' : 'Create SOP'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'DROP' ? 'Upload SOP' : step === 'PROCESSING' ? 'Processing Files' : 'Review Import'}
    >
      <div className="w-full max-w-2xl mx-auto">
        {step === 'DROP' && renderDropZone()}
        {step === 'PROCESSING' && renderProcessing()}
        {step === 'REVIEW' && renderReview()}
      </div>
    </Modal>
  );
};
