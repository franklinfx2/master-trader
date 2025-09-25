-- Fix commission data security issue
-- Remove the overly permissive "System can manage commissions" policy
DROP POLICY IF EXISTS "System can manage commissions" ON public.commissions;

-- Add proper policies for commission management
-- Only service role (edge functions) can create new commissions
CREATE POLICY "Service role can create commissions" 
ON public.commissions 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Only service role can update commissions (for status changes, payment references)
CREATE POLICY "Service role can update commissions" 
ON public.commissions 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Only service role can delete commissions (if needed for cleanup)
CREATE POLICY "Service role can delete commissions" 
ON public.commissions 
FOR DELETE 
TO service_role
USING (true);