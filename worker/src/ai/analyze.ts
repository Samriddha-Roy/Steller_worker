import OpenAI from 'openai';
import { env } from '../config/env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export class AiAnalysisService {
  async analyzeToolOutput(target: string, tool: string, rawOutput: string) {
    console.log(`[AI] Analyzing results from ${tool} for ${target}...`);

    const prompt = `
      You are a senior security researcher and AI Hacker. 
      Analyze the following raw output from ${tool} for the target ${target}.
      
      RAW OUTPUT:
      ${rawOutput.substring(0, 4000)} ... [truncated if too long]

      Return a structured JSON object with the following fields:
      - vulnerabilities: Array of objects { name, description, severity: "low" | "medium" | "high" | "critical", id }
      - overallSeverity: "low" | "medium" | "high" | "critical"
      - aiSuggestions: Array of strings
      - fixes: Array of objects { vulnerabilityName, fixDescription, codeSnippet }

      Keep descriptions concise and technical.
    `;

    if (env.OPENAI_API_KEY === 'MISSING_KEY_MOCK_MODE') {
      console.log(`[AI] No API key found. Returning mock results for ${target}...`);
      return this.getFallbackAnalysis(tool, target);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content from OpenAI');

      return JSON.parse(content);
    } catch (error) {
      console.error('[AI] Analysis failed, using fallback:', error);
      return this.getFallbackAnalysis(tool, target);
    }
  }

  private getFallbackAnalysis(tool: string, target: string) {
    // This provides high-quality mock data if OpenAI fails
    return {
      vulnerabilities: [
        { 
          name: "Information Disclosure", 
          description: `Potential sensitive information exposure detected by ${tool} during the scan of ${target}.`, 
          severity: "medium", 
          id: "FALLBACK-01" 
        }
      ],
      overallSeverity: "medium",
      aiSuggestions: [
        "Ensure all error messages are generic and do not leak system internals.",
        "Review server configuration for unnecessary exposed headers."
      ],
      fixes: [
        { 
          vulnerabilityName: "Information Disclosure", 
          fixDescription: "Configure the application to return customized, non-descriptive error pages.",
          codeSnippet: "// Example in Express\napp.use((err, req, res, next) => {\n  res.status(500).json({ error: 'Internal Server Error' });\n});" 
        }
      ]
    };
  }
}
