import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
// import { OpenAI } from 'langchain';
// import { VectorDBQA } from 'langchain/chains';
// import { RetrievalQA } from 'langchain/chains';
import { PagedPDFSplitter } from 'langchain/document_loaders';


/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new CustomPDFLoader(path),
    });

    // const loader = new PDFLoader(filePath);
//     const rawDocs = await directoryLoader.load();
    import * as fs from 'fs';

    const directoryPath = '/content/docs';

    const fileNames: string[] = fs.readdirSync(directoryPath);

    const docs: string[] = [];

    for (let i = 0; i < fileNames.length; i++) {
      const bookPath = `${directoryPath}/${fileNames[i]}`;
      console.log(i);
      console.log(bookPath);
      const loader = new PagedPDFSplitter(bookPath);
      docs.push(...loader.loadAndSplit());
    }


    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    // iterate through each document in the list and append a string
//     for (let i = 0; i < docs.length; i++) {
//       docs[i].pageContent += '\nSource: ' + docs[i].metadata.source;
//     }

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
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
