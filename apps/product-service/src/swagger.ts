import swaggerAutogen from 'swagger-autogen';
import { join } from 'path';
// Import your main file or router
import './main'; 

const doc = {
  info: {
    title: 'Product Service API',
    description: 'Auto-generated documentation',
    version: '1.0.0',
  },
  host: 'localhost:6099',
  schemes: ['http'],
};

const outputFile = join(__dirname, 'swagger-output.json');
const endpointsFiles = [join(__dirname, 'main.ts')];

// Execute
swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger JSON generated successfully');
  process.exit(0);
});