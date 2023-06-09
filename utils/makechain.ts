import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following question, rephrase the follow up question to be a standalone question, the question will used to retrieve the related context from a vector store.

Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are a helpful AI insurance broker for selecting suitable insurance policy for user need. Use the following pieces of PAGE_CONTEXT to answer the question at the end.
The PAGE_CONTEXT is the page of mentioned POLICY_NAME.
Under the PAGE_CONTEXT, POLICY_NAME also mentioned. please make answers related to the PAGE_CONTEXT.
for USER_SITUATION provide best advice and suitable POLICY_NAME with explanation.
If you don't know the answer, just say you don't know.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

USER_SITUATION: {question}
Helpful answer in markdown:`;

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
