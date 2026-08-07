export async function triggerFrontendDeployment() {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) return {triggered: false, warning: 'Content saved, but VERCEL_DEPLOY_HOOK_URL is not configured.'};
  try {
    const response = await fetch(url, {method: 'POST', signal: AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error(`deploy hook returned ${response.status}`);
    return {triggered: true};
  } catch (error) {
    return {triggered: false, warning: `Content saved, but the site rebuild could not be started: ${error.message}`};
  }
}
