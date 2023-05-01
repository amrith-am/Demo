import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const loader = new PDFLoader("docs/anatomy.pdf");
    const docs = await loader.load();
    // const directoryLoader = new DirectoryLoader(filePath, {
    //   '.pdf': (path) => new CustomPDFLoader(path),
    // });

    // // const loader = new PDFLoader(filePath);
    // const rawDocs = await directoryLoader.load();

    // /* Split text into chunks */
    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 2000,
    //   chunkOverlap: 200,
    // });

    // const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);
    let newList = [];

    // iterate through each document in the list and append a string
    for (let i = 0; i < docs.length; i++) {
      let updatedDoc = docs[i] + "docs/anatomy.pdf";
      // add the updated document to the new list
      newList.push(updatedDoc);
    }

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(newList, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
