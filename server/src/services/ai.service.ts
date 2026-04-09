import { openai } from '../config/openai';

export class AiService {
  async analyzeVulnerabilities(scanTarget: string, rawOutput: string) {
    // In a real scenario, you'd send `rawOutput` (trimmed) to OpenAI
    const prompt = `You are a cybersecurity expert. Analyze the following mock scan results for target: ${scanTarget}. 
    Raw Output: ${rawOutput.substring(0, 500)}...
    
    Return a structured JSON with the following format:
    {
      "vulnerabilities": [{ "name": "string", "description": "string", "severity": "low|medium|high|critical" }],
      "overallSeverity": "low|medium|high|critical",
      "aiSuggestions": ["string list of general suggestions"],
      "fixes": [{ "vulnerabilityName": "string", "fixDescription": "string", "codeSnippet": "string if applicable" }]
    }`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      });

      const messageContent = response.choices[0].message.content;
      if (!messageContent) throw new Error("Empty AI response");

      return JSON.parse(messageContent);
    } catch (error) {
      console.error("[AiService] Error generating analysis:", error);
      // Fallback response for hackathon if OpenAI fails
      return {
        vulnerabilities: [
          { name: "Mock XSS", description: "Reflected XSS found.", severity: "high" }
        ],
        overallSeverity: "high",
        aiSuggestions: ["Sanitize all user inputs"],
        fixes: [
          { vulnerabilityName: "Mock XSS", fixDescription: "Use DOMPurify.", codeSnippet: "const clean = DOMPurify.sanitize(input);" }
        ]
      };
    }
  }
}
