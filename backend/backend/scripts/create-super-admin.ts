
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odfnlpmkkdkrcanyubip.supabase.co';
const supabaseKey = 'sb_publishable_WJreEf0WIvomXxWV41LKfw_K6HWlmJ5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSuperAdmin() {
    const email = 'superadmin@sophub.com';
    const password = 'Super@2025';

    console.log(`Creating user ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: 'Super',
                last_name: 'Admin',
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        process.exit(1);
    }

    console.log('User created successfully:', data.user?.id);
    console.log('Note: User still needs email verification and role update via SQL.');
}

createSuperAdmin();
