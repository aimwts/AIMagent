import { GoogleGenAI, Type } from "@google/genai";
import { AgentRole, AgentLog, AppState } from "../types.ts";
import { AGENT_SYSTEM_PROMPTS } from "../constants.ts";

// Correctly initialize GoogleGenAI using the mandatory named parameter for apiKey.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AgentWorkflowResult {
  response: string;
  logs: AgentLog[];
  updatedTasks?: any[];
  updatedEvents?: any[];
}

export async function runAgentWorkflow(
  userInput: string,
  state: AppState,
  onLogUpdate: (log: AgentLog) => void
): Promise<AgentWorkflowResult> {
  const logs: AgentLog[] = [];

  const addLog = (role: AgentRole, content: string) => {
    const log: AgentLog = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      content,
      timestamp: new Date(),
    };
    logs.push(log);
    onLogUpdate(log);
  };

  try {
    // --- Step 1: Planner Agent ---
    // Using gemini-3-pro-preview for complex reasoning tasks as per guidelines.
    addLog(AgentRole.PLANNER, "Analyzing user request and state...");
    const plannerResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `User Request: ${userInput}\n\nCurrent App State: ${JSON.stringify({
        tasks: state.tasks,
        events: state.events
      })}\n\nTask: ${AGENT_SYSTEM_PROMPTS.PLANNER}`,
      config: {
        thinkingConfig: { thinkingBudget: 10000 }
      }
    });
    
    addLog(AgentRole.PLANNER, plannerResponse.text || "Decomposed into strategy: Fetch state, Process logic, Review.");

    // --- Step 2: Manager/Executor Agent ---
    addLog(AgentRole.MANAGER, "Retrieving relevant data...");
    const toolResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Strategy: ${plannerResponse.text}\nUser Query: ${userInput}\n\nTask: ${AGENT_SYSTEM_PROMPTS.EXECUTOR}. If the user wants to add/remove tasks or events, provide a JSON structure reflecting changes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            answer: { type: Type.STRING },
            newTasks: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  category: { type: Type.STRING }
                } 
              } 
            },
            newEvents: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING }, 
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  type: { type: Type.STRING },
                  location: { type: Type.STRING }
                } 
              } 
            }
          }
        }
      }
    });

    const executionData = JSON.parse(toolResponse.text || '{}');
    addLog(AgentRole.EXECUTOR, executionData.reasoning || "Executed request logic.");

    // --- Step 3: Reviewer Agent ---
    addLog(AgentRole.REVIEWER, "Polishing final response...");
    const finalResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Raw Execution Result: ${executionData.answer}\n\nTask: ${AGENT_SYSTEM_PROMPTS.REVIEWER}`,
    });

    return {
      response: finalResponse.text || "I've handled that for you.",
      logs,
      updatedTasks: executionData.newTasks,
      updatedEvents: executionData.newEvents
    };

  } catch (error) {
    console.error("Workflow failed:", error);
    addLog(AgentRole.REVIEWER, "Error occurred during agent orchestration. Falling back to simple response.");
    return {
      response: "I encountered an issue coordinating my internal agents. Please try again.",
      logs
    };
  }
}