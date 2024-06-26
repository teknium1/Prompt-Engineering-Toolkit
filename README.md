# Prompt Engineering Tool

## Description

The Prompt Engineering Tool is a web-based application designed to help users experiment with and optimize prompts for various large language models (LLMs). It allows users to:

![image](https://github.com/teknium1/Prompt-Engineering-Toolkit/assets/127238744/9611af16-a950-41e6-91d2-22f077e6496d)

- Test prompts across multiple LLM providers simultaneously
- Save and load prompt templates
- Manage variables for dynamic prompt generation
- Save and load model configurations
- Compare outputs from different models side-by-side

This tool is particularly useful for developers, researchers, and content creators working with AI language models to refine their prompts and achieve better results.

## Features

- Support for multiple LLM providers (currently OpenAI and Anthropic)
- Global and individual prompt modes
- Variable management for dynamic prompt generation
- Save and load functionality for prompts, variables, and model configurations
- Responsive design with resizable panels
- Temperature adjustment for each model

## Setup

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Teknium1/prompt-engineering-toolkit.git
```  

2. Navigate to the project directory:

```bash
cd prompt-engineering-toolkit
```  

3. Install the dependencies:
```bash
npm install
```  

This will install the following main libraries:
- `react` and `react-dom`: For building the user interface
- `@mui/material` and `@emotion/react`: For Material-UI components and styling
- `axios`: For making HTTP requests to the LLM APIs
- `react-resizable-panels`: For the resizable panel layout

4. Create a `.env` file in the root directory and add your API keys:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

5. Start the development server:
```bash
npm start
```  

6. Open your browser and visit `http://localhost:3000` to use the application.

## Usage

1. Configure your API keys for the LLM providers you want to use (OpenAI, Anthropic, etc.) in the "Model Configurations" section.

2. Create variables if needed in the "Variables" section.

3. Enter your prompt in the main prompt area or use the global prompt feature.

4. Click "Run Prompt" to send the prompt to the configured models.

5. View the outputs in the respective model sections.

6. Save prompts, variables, or model configurations for future use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

```
MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.```

