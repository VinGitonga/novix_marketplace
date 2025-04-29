export const aiAgentMarketplaceQueryTemplate = `Given the last message:
{{lastMessage}}

Extract the following information about the user's query regarding AI agents on the marketplace to form a search query string and maximum results, based on the Agent entity schema with fields: name, username, description, summary, bio (array of strings), prompt, topics (array of strings), elizaId, worldId, elizaMetadata, and owner (User reference). The schema has a text index on name, summary, description, bio, topics, and prompt.

1. **Query**:
   - Construct a single string representing the user's query in a simplified format compatible with the backend, starting with "query" followed by the query type and relevant details, if specified:
     - **Query Type**: Identify the type of query based on the user's intent:
       - "list" for general listing of agents (e.g., "list all AI agents").
       - "details" for specific agent details (e.g., requesting details about a named agent or ID).
       - "search" for searching agents based on keywords or topics (e.g., searching by topics or keywords).
       - "compare" for comparing multiple agents (e.g., comparing agents by name).
     - **Agent Name**: Include if the user specifies an agent's name (e.g., "CodeMaster"). Append after the query type (e.g., "details CodeMaster").
     - **Topics**: Include if the user specifies topics (e.g., "Coding", "Healthcare"). Append as space-separated words after "search" (e.g., "search Coding Healthcare").
     - **Search Keywords**: Include keywords for text search across name, summary, description, bio, topics, or prompt (e.g., "natural language processing"). Append as space-separated words after "search" (e.g., "search natural language processing").
     - **Eliza ID**: Include if a specific agent ID is provided (e.g., "AGENT-1234"). Append after the query type (e.g., "details AGENT-1234").
   - Format the query string starting with "query" followed by the query type and any extracted details:
     - Combine components with spaces to form a single string.
     - For "list" queries without specific filters, use "query list all AI agents".
     - For "details" queries, append the agent name or elizaId (e.g., "query details CodeMaster" or "query details AGENT-1234").
     - For "search" queries, append topics and keywords as space-separated words (e.g., "query search Healthcare natural language processing").
     - For "compare" queries, append agent names (e.g., "query compare CodeMaster HealthAdvisor").
   - If no specific components are specified, default to "query list all AI agents" for a general listing.

2. **Max Results**:
   - Extract the maximum number of results the user wants, if specified.
   - Must be a string representing a positive integer (e.g., "10", "50").
   - If not provided, default to "10".

Always try to extract the information from the last message! Do not use previously completed requests' data to fill extracted information!

Respond with a JSON markdown block containing the extracted values:
\`\`\`json
{
    "query": string,
    "maxResults": string
}
\`\`\`

Example response for the input: "Show me all AI agents with topics in Coding":
\`\`\`json
{
    "query": "query search Coding",
    "maxResults": "10"
}
\`\`\`

Example response for the input: "Tell me about the AI agent CodeMaster with ID AGENT-1234, show 5 results":
\`\`\`json
{
    "query": "query details CodeMaster AGENT-1234",
    "maxResults": "5"
}
\`\`\`

Example response for the input: "Find AI agents with natural language processing and real-time analytics in Healthcare, limit to 20 results":
\`\`\`json
{
    "query": "query search Healthcare natural language processing real-time analytics",
    "maxResults": "20"
}
\`\`\`

Example response for the input: "Compare agents with names CodeMaster and HealthAdvisor":
\`\`\`json
{
    "query": "query compare CodeMaster HealthAdvisor",
    "maxResults": "10"
}
\`\`\`

Example response for the input: "What AI agents are available?":
\`\`\`json
{
    "query": "query list all AI agents",
    "maxResults": "10"
}
\`\`\`

Example response for the input: "Search for agents with prompt containing 'machine learning' and topic Finance, show 15 results":
\`\`\`json
{
    "query": "query search Finance machine learning",
    "maxResults": "15"
}
\`\`\`

Example response for the input: "query list all AI agents":
\`\`\`json
{
    "query": "query list all AI agents",
    "maxResults": "10"
}
\`\`\`

Now respond with a JSON markdown block containing the extracted values for the last message.
`;
