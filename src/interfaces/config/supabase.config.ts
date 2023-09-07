import { createClient } from "@supabase/supabase-js";
import { AppConfig } from "./config";

const CONFIG = AppConfig();

const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseKey = CONFIG.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
