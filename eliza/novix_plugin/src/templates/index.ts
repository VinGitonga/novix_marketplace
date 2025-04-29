export const aiAgentMarketplaceQueryTemplate = `Given the last message:
{{lastMessage}}

Extract the following information about the user's query regarding AI agents on the marketplace to form a search query string and maximum results, based on the Agent entity schema with fields: name, username, description, summary, bio (array of strings), prompt, topics (array of strings), elizaId, worldId, elizaMetadata, and owner (User reference). The schema has a text index on name, summary, description, bio, topics, and prompt.

1. **Query**:
   - Construct a single string representing the user's query for MongoDB, based on the following components, if specified:
     - **Agent Name**: Include if the user specifies an agent's name (e.g., "CodeMaster"). Use for exact match or text search (e.g., "name:CodeMaster" or part of $text search).
     - **Topics**: Include if the user specifies topics (e.g., "Coding", "Healthcare"). Format as "topics:Coding" or combine multiple topics with spaces (e.g., "topics:Coding topics:Healthcare").
     - **Search Keywords**: Include keywords for text search across name, summary, description, bio, topics, or prompt (e.g., "natural language processing"). Format as a space-separated list for $text search (e.g., "natural language processing").
     - **Eliza ID**: Include if a specific agent ID is provided (e.g., "AGENT-1234"). Format as "elizaId:AGENT-1234".
     - **Query Type**: Include the type of query ("list", "details", "search", "compare"). Format as "queryType=<value>".
   - Combine components with spaces to form a MongoDB-compatible query string.
   - For text search keywords, group them without prefixes (e.g., "natural language processing") to leverage the $text index.
   - For specific fields (name, topics, elizaId), prefix with the field name (e.g., "name:CodeMaster", "topics:Coding").
   - If no components are specified, use "queryType=list" for a general listing.
   - Example: "queryType=details name:CodeMaster elizaId:AGENT-1234" or "queryType=search topics:Healthcare natural language processing"

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

Example response for the input: "Show me all AI agents with topics in Coding", the response should be:
\`\`\`json
{
    "query": "queryType=list topics:Coding",
    "maxResults": "10"
}
\`\`\`

Example response for the input: "Tell me about the AI agent CodeMaster with ID AGENT-1234, show 5 results", the response should be:
\`\`\`json
{
    "query": "queryType=details name:CodeMaster elizaId:AGENT-1234",
    "maxResults": "5"
}
\`\`\`

Example response for the input: "Find AI agents with natural language processing and real-time analytics in Healthcare, limit to 20 results", the response should be:
\`\`\`json
{
    "query": "queryType=search topics:Healthcare natural language processing real-time analytics",
    "maxResults": "20"
}
\`\`\`

Example response for the input: "Compare agents with names CodeMaster and HealthAdvisor", the response should be:
\`\`\`json
{
    "query": "queryType=compare name:CodeMaster name:HealthAdvisor",
    "maxResults": "10"
}
\`\`\`

Example response for the input: "What AI agents are available?", the response should be:
\`\`\`json
{
    "query": "queryType=list",
    "maxResults": "10"
}
\`\`\`

Example response for the input: "Search for agents with prompt containing 'machine learning' and topic Finance, show 15 results", the response should be:
\`\`\`json
{
    "query": "queryType=search topics:Finance machine learning",
    "maxResults": "15"
}
\`\`\`

Now respond with a JSON markdown block containing the extracted values.
`;
