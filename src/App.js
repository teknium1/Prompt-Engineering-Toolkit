import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    List,
    ListItem,
    MenuItem,
    Paper,
    Select,
    Slider,
    Switch,
    TextField,
    Toolbar,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels';

function App() {
    const ProviderCanQueryModelList = ["llamaedge"]

    const [modelConfigs, setModelConfigs] = useState([{
        id: Date.now(),
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: '',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        prompts: [{id: Date.now(), systemPrompt: '', userPrompt: '', output: ''}]
    }]);
    const [variables, setVariables] = useState([]);
    const [savedPrompts, setSavedPrompts] = useState([]);
    const [savedModels, setSavedModels] = useState([]);
    const [savedVariables, setSavedVariables] = useState([]);
    const [openSaveModelDialog, setOpenSaveModelDialog] = useState(false);
    const [openSaveVariablesDialog, setOpenSaveVariablesDialog] = useState(false);
    const [openSavePromptDialog, setOpenSavePromptDialog] = useState(false);
    const [modelNameToSave, setModelNameToSave] = useState('');
    const [variablesNameToSave, setVariablesNameToSave] = useState('');
    const [promptNameToSave, setPromptNameToSave] = useState('');
    const [modelToSave, setModelToSave] = useState(null);
    const [promptToSave, setPromptToSave] = useState(null);
    const [globalSystemPrompt, setGlobalSystemPrompt] = useState('');
    const [globalUserPrompt, setGlobalUserPrompt] = useState('');
    const [useGlobalPrompt, setUseGlobalPrompt] = useState(false);
    const [selectedReviewModel, setSelectedReviewModel] = useState('');
    const [promptReviewSuggestion, setPromptReviewSuggestion] = useState('');

    const [modelsList, setModelsList] = useState({});

    useEffect(() => {
        const saved = localStorage.getItem('savedPrompts');
        if (saved) setSavedPrompts(JSON.parse(saved));
        const savedModelsData = localStorage.getItem('savedModels');
        if (savedModelsData) setSavedModels(JSON.parse(savedModelsData));
        const savedVariablesData = localStorage.getItem('savedVariables');
        if (savedVariablesData) setSavedVariables(JSON.parse(savedVariablesData));
    }, []);

    const handleAddVariable = () => setVariables([...variables, {name: '', value: ''}]);

    const handleVariableChange = (index, field, value) => {
        const newVariables = [...variables];
        newVariables[index][field] = value;
        setVariables(newVariables);
    };

    const handleDeleteVariable = (index) => {
        const newVariables = variables.filter((_, i) => i !== index);
        setVariables(newVariables);
    };

    const queryModel = async (id, url) => {
        try {
            let baseUrl = url.split('/').slice(0, 4).join('/');
            const query = await fetch(baseUrl + "/models")
            const queryData = await query.json()
            const newData = {...modelsList}
            newData[id] = queryData.data.map(model => model.id)
            setModelsList(newData)
        } catch (e) {
            console.log(e)
        }
    }

    const handleModelConfigChange = (id, field, value) => {
        const newConfigs = modelConfigs.map(config => {
            if (config.id === id) {
                if (field === "endpoint" && ProviderCanQueryModelList.includes(config.provider) && value) {
                    queryModel(id, value)
                }
                return {...config, [field]: value}
            } else {
                return config
            }
        });
        setModelConfigs(newConfigs);
    };

    const handleMultipleModelConfigChange = (id, updates) => {
        const newConfigs = modelConfigs.map(config => config.id === id ? {...config, ...updates} : config);
        setModelConfigs(newConfigs);
    };

    const handleAddModel = () => {
        const newModel = {
            id: Date.now(),
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1000,
            apiKey: '',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            prompts: [{id: Date.now(), systemPrompt: '', userPrompt: '', output: ''}]
        };
        setModelConfigs([...modelConfigs, newModel]);
    };

    const handleDeleteModel = (id) => {
        const newConfigs = modelConfigs.filter(config => config.id !== id);
        setModelConfigs(newConfigs);
    };

    const handleAddPrompt = (modelId) => {
        const model = modelConfigs.find(m => m.id === modelId);
        if (model.prompts[model.prompts.length - 1].output) {
            const newConfigs = modelConfigs.map(config => {
                if (config.id === modelId) {
                    return {
                        ...config, prompts: [...config.prompts, {id: Date.now(), userPrompt: '', output: ''}]
                    };
                }
                return config;
            });
            setModelConfigs(newConfigs);
        }
    };


    const handlePromptChange = (modelId, promptId, field, value) => {
        const newConfigs = modelConfigs.map(config => {
            if (config.id === modelId) {
                return {
                    ...config,
                    prompts: config.prompts.map(prompt => prompt.id === promptId ? {...prompt, [field]: value} : prompt)
                };
            }
            return config;
        });
        setModelConfigs(newConfigs);
    };

    const handleRemoveLastTurn = (modelId) => {
        const newConfigs = modelConfigs.map(config => {
            if (config.id === modelId && config.prompts.length > 1) {
                return {
                    ...config, prompts: config.prompts.slice(0, -1)
                };
            }
            return config;
        });
        setModelConfigs(newConfigs);
    };

    const openSavePromptDialogHandler = (modelId, promptId) => {
        setPromptToSave({modelId, promptId});
        setPromptNameToSave('');
        setOpenSavePromptDialog(true);
    };

    const savePrompt = () => {
        if (promptNameToSave) {
            let promptContent;
            if (useGlobalPrompt) {
                promptContent = {systemPrompt: globalSystemPrompt, userPrompt: globalUserPrompt};
            } else if (promptToSave) {
                const {modelId, promptId} = promptToSave;
                const model = modelConfigs.find(m => m.id === modelId);
                const prompt = model.prompts.find(p => p.id === promptId);
                promptContent = {systemPrompt: prompt.systemPrompt, userPrompt: prompt.userPrompt};
            }
            const newSavedPrompts = [...savedPrompts, {name: promptNameToSave, content: promptContent}];
            setSavedPrompts(newSavedPrompts);
            localStorage.setItem('savedPrompts', JSON.stringify(newSavedPrompts));
            setOpenSavePromptDialog(false);
        }
    };

    const loadPrompt = (savedPrompt) => {
        if (useGlobalPrompt) {
            setGlobalSystemPrompt(savedPrompt.content.systemPrompt);
            setGlobalUserPrompt(savedPrompt.content.userPrompt);
        } else {
            const newConfigs = modelConfigs.map(config => ({
                ...config, prompts: config.prompts.map(prompt => ({
                    ...prompt,
                    systemPrompt: savedPrompt.content.systemPrompt,
                    userPrompt: savedPrompt.content.userPrompt
                }))
            }));
            setModelConfigs(newConfigs);
        }
    };

    const removeSavedPrompt = (index) => {
        const newSavedPrompts = savedPrompts.filter((_, i) => i !== index);
        setSavedPrompts(newSavedPrompts);
        localStorage.setItem('savedPrompts', JSON.stringify(newSavedPrompts));
    };

    const openSaveModelDialogHandler = (model) => {
        setModelToSave(model);
        setModelNameToSave('');
        setOpenSaveModelDialog(true);
    };

    const saveModel = () => {
        if (modelNameToSave && modelToSave) {
            const modelToSaveWithoutId = {...modelToSave, id: undefined};
            const newSavedModels = [...savedModels, {name: modelNameToSave, config: modelToSaveWithoutId}];
            setSavedModels(newSavedModels);
            localStorage.setItem('savedModels', JSON.stringify(newSavedModels));
            setOpenSaveModelDialog(false);
        }
    };

    const loadModel = (savedModel, modelId) => {
        const newConfigs = modelConfigs.map(config => {
            if (config.id === modelId) {
                return {
                    ...config, ...savedModel.config, id: config.id, prompts: config.prompts
                };
            }
            return config;
        });
        setModelConfigs(newConfigs);
    };

    const removeSavedModel = (index) => {
        const newSavedModels = savedModels.filter((_, i) => i !== index);
        setSavedModels(newSavedModels);
        localStorage.setItem('savedModels', JSON.stringify(newSavedModels));
    };

    const openSaveVariablesDialogHandler = () => {
        setVariablesNameToSave('');
        setOpenSaveVariablesDialog(true);
    };

    const saveVariables = () => {
        if (variablesNameToSave) {
            const newSavedVariables = [...savedVariables, {name: variablesNameToSave, variables: variables}];
            setSavedVariables(newSavedVariables);
            localStorage.setItem('savedVariables', JSON.stringify(newSavedVariables));
            setOpenSaveVariablesDialog(false);
        }
    };

    const loadVariables = (savedVariableSet) => {
        setVariables(savedVariableSet.variables);
    };

    const removeSavedVariables = (index) => {
        const newSavedVariables = savedVariables.filter((_, i) => i !== index);
        setSavedVariables(newSavedVariables);
        localStorage.setItem('savedVariables', JSON.stringify(newSavedVariables));
    };

    const toggleGlobalPrompt = () => {
        setUseGlobalPrompt(!useGlobalPrompt);
    };

    const runPrompt = async (modelId, promptId) => {
        const model = modelConfigs.find(m => m.id === modelId);
        const prompt = model.prompts.find(p => p.id === promptId);
        let messages = [];

        if (promptId === model.prompts[0].id && useGlobalPrompt) {
            messages = [{role: 'system', content: globalSystemPrompt}, {role: 'user', content: globalUserPrompt}];
        } else {
            const previousPrompts = model.prompts.slice(0, model.prompts.findIndex(p => p.id === promptId) + 1);
            messages = previousPrompts.flatMap((p, index) => {
                if (index === 0 && !useGlobalPrompt) {
                    return [{role: 'system', content: p.systemPrompt}, {role: 'user', content: p.userPrompt}];
                } else {
                    return [{role: 'user', content: p.userPrompt}, ...(p.output ? [{
                        role: 'assistant', content: p.output
                    }] : [])];
                }
            });
        }

        // Apply variables
        messages = messages.map(message => ({
            ...message,
            content: variables.reduce((content, variable) => content.replace(new RegExp(`\\{${variable.name}\\}`, 'g'), variable.value), message.content)
        }));

        try {
            let response;
            switch (model.provider) {
                case 'openai':
                case 'llamaedge':
                    response = await axios.post(model.endpoint, {
                        model: model.model,
                        messages: messages,
                        temperature: model.temperature,
                        max_tokens: model.maxTokens,
                    }, {
                        headers: {'Authorization': `Bearer ${model.apiKey}`}
                    });
                    break;
                case 'anthropic':
                    // Implement Anthropic API call here
                    break;
                case 'azure':
                    response = await axios.post(`https://${model.resourceName}.openai.azure.com/openai/deployments/${model.deploymentId}/chat/completions?api-version=2023-05-15`, {
                        messages: messages, temperature: model.temperature, max_tokens: model.maxTokens,
                    }, {
                        headers: {'api-key': model.apiKey}
                    });
                    break;
                case 'bedrock':
                    // This is a placeholder and won't work as-is
                    // You'll need to use AWS SDK for JavaScript v3 for this
                    console.log('Amazon Bedrock API call not implemented');
                    break;
                default:
                    throw new Error('Unknown provider');
            }

            const output = response.data.choices[0].message.content;
            setModelConfigs(prevConfigs => prevConfigs.map(config => {
                if (config.id === modelId) {
                    return {
                        ...config, prompts: config.prompts.map(p => p.id === promptId ? {...p, output} : p)
                    };
                }
                return config;
            }));
        } catch (error) {
            console.error('Error calling API:', error);
            const errorOutput = `Error: ${error.message}`;
            setModelConfigs(prevConfigs => prevConfigs.map(config => {
                if (config.id === modelId) {
                    return {
                        ...config, prompts: config.prompts.map(p => p.id === promptId ? {...p, output: errorOutput} : p)
                    };
                }
                return config;
            }));
        }
    };

    const runAllPrompts = async () => {
        for (const config of modelConfigs) {
            for (const prompt of config.prompts) {
                await runPrompt(config.id, prompt.id);
            }
        }
    };

    const reviewPrompt = async () => {
        if (!selectedReviewModel) return;

        const model = savedModels.find(m => m.name === selectedReviewModel)?.config;
        if (!model) return;

        const prompt = `Please review and suggest improvements for the following prompt:
System Prompt: ${globalSystemPrompt}
User Prompt: ${globalUserPrompt}

Provide concise suggestions to improve the prompt's effectiveness.`;

        try {
            const response = await axios.post(model.endpoint, {
                model: model.model,
                messages: [{role: 'user', content: prompt}],
                temperature: model.temperature,
                max_tokens: model.maxTokens,
            }, {
                headers: {'Authorization': `Bearer ${model.apiKey}`}
            });
            setPromptReviewSuggestion(response.data.choices[0].message.content);
        } catch (error) {
            console.error('Error reviewing prompt:', error);
            setPromptReviewSuggestion(`Error reviewing prompt: ${error.message}`);
        }
    };

    const saveConversationData = () => {
        const conversationData = modelConfigs.map(config => {
            const modelName = savedModels.find(m => m.config.model === config.model)?.name || `${config.provider}-Endpoint-${config.endpoint.split('/').pop()}-${config.model}-temp-${config.temperature}`;

            const conversations = config.prompts.flatMap(prompt => [{
                role: "system", content: prompt.systemPrompt
            }, {role: "user", content: prompt.userPrompt}, {role: "assistant", content: prompt.output}]);

            return {
                conversations, model: modelName
            };
        });

        const jsonData = JSON.stringify(conversationData, null, 2);
        const blob = new Blob([jsonData], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `conversation-${uuidv4()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (<Box sx={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <Typography variant="h4" gutterBottom sx={{p: 2}}>Prompt Engineering Tool</Typography>
        <Box sx={{display: 'flex', flexGrow: 1, overflow: 'hidden'}}>
            <PanelGroup direction="horizontal" style={{flexGrow: 1}}>
                <Panel defaultSize={20} minSize={15} style={{height: '100%', overflow: 'auto'}}>
                    <Paper sx={{p: 2, height: '100%'}}>
                        <Typography variant="h6" gutterBottom>Saved Prompts</Typography>
                        <List>
                            {savedPrompts.map((savedPrompt, index) => (
                                <ListItem key={index} disablePadding sx={{mb: 1}}>
                                    <Button variant="outlined" onClick={() => loadPrompt(savedPrompt)}
                                            sx={{mr: 1, flexGrow: 1}}>
                                        {savedPrompt.name}
                                    </Button>
                                    <IconButton onClick={() => removeSavedPrompt(index)}><DeleteIcon/></IconButton>
                                </ListItem>))}
                        </List>
                    </Paper>
                </Panel>
                <PanelResizeHandle style={{width: '8px', background: '#f0f0f0', cursor: 'col-resize'}}/>
                <Panel style={{height: '100%', overflow: 'auto'}}>
                    <Box sx={{height: '100%', overflowY: 'auto', p: 2}}>
                        <Paper sx={{p: 2, mb: 2}}>
                            <FormControlLabel
                                control={<Switch checked={useGlobalPrompt} onChange={toggleGlobalPrompt}/>}
                                label="Use Global Prompt"
                            />
                            {useGlobalPrompt && (<>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={4}
                                    label="Global System Prompt"
                                    value={globalSystemPrompt}
                                    onChange={(e) => setGlobalSystemPrompt(e.target.value)}
                                    variant="outlined"
                                    sx={{mt: 2, mb: 2}}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    maxRows={8}
                                    label="Global User Prompt"
                                    value={globalUserPrompt}
                                    onChange={(e) => setGlobalUserPrompt(e.target.value)}
                                    variant="outlined"
                                    sx={{mb: 2}}
                                />
                            </>)}
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                <Button variant="contained" onClick={runAllPrompts} disabled={!useGlobalPrompt}>
                                    Run Global Prompt
                                </Button>
                                <Button variant="outlined" onClick={() => openSavePromptDialogHandler(null, null)}
                                        disabled={!useGlobalPrompt}>
                                    Save Global Prompt
                                </Button>
                            </Box>
                        </Paper>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                            {modelConfigs.map((config) => (<Box key={config.id}
                                                                sx={{
                                                                    flexGrow: 1,
                                                                    flexBasis: 'calc(50% - 16px)',
                                                                    minWidth: 300
                                                                }}>
                                <Paper sx={{p: 2, height: '100%'}}>
                                    <FormControl fullWidth sx={{mb: 2}}>
                                        <InputLabel>Model</InputLabel>
                                        <Select
                                            value={config.model}
                                            label="Model"
                                            onChange={(e) => {
                                                const savedModel = savedModels.find(m => m.name === e.target.value);
                                                if (savedModel) {
                                                    loadModel(savedModel, config.id);
                                                } else {
                                                    handleModelConfigChange(config.id, 'model', e.target.value);
                                                }
                                            }}
                                        >
                                            <MenuItem value={config.model}>{config.model}</MenuItem>
                                            {savedModels.map((savedModel, index) => (<MenuItem key={index}
                                                                                               value={savedModel.name}>{savedModel.name}</MenuItem>))}
                                        </Select>
                                    </FormControl>
                                    {!useGlobalPrompt ? (config.prompts.map((prompt, index) => (
                                        <Box key={prompt.id} sx={{mb: 2}}>
                                            <Typography variant="h6"
                                                        gutterBottom>Turn {index + 1}</Typography>
                                            {index === 0 && (<TextField
                                                fullWidth
                                                multiline
                                                minRows={2}
                                                maxRows={4}
                                                label="System Prompt"
                                                value={prompt.systemPrompt}
                                                onChange={(e) => handlePromptChange(config.id, prompt.id, 'systemPrompt', e.target.value)}
                                                variant="outlined"
                                                sx={{mb: 2}}
                                            />)}
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={4}
                                                maxRows={8}
                                                label="User Prompt"
                                                value={prompt.userPrompt}
                                                onChange={(e) => handlePromptChange(config.id, prompt.id, 'userPrompt', e.target.value)}
                                                variant="outlined"
                                                sx={{mb: 2}}
                                            />
                                            <Box sx={{
                                                display: 'flex', justifyContent: 'space-between', mb: 2
                                            }}>
                                                <Button variant="contained"
                                                        onClick={() => runPrompt(config.id, prompt.id)}>
                                                    Run Prompt
                                                </Button>
                                                <Button variant="outlined"
                                                        onClick={() => openSavePromptDialogHandler(config.id, prompt.id)}>
                                                    Save Prompt
                                                </Button>
                                            </Box>
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={4}
                                                maxRows={20}
                                                label="Output"
                                                value={prompt.output}
                                                variant="outlined"
                                                InputProps={{readOnly: true}}
                                                sx={{mb: 2}}
                                            />
                                        </Box>))) : (<TextField
                                        fullWidth
                                        multiline
                                        minRows={4}
                                        maxRows={20}
                                        label="Output"
                                        value={config.prompts[0]?.output || ''}
                                        variant="outlined"
                                        InputProps={{readOnly: true}}
                                        sx={{mb: 2}}
                                    />)}
                                    {!useGlobalPrompt && (<Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                        {config.prompts[config.prompts.length - 1].output && (<Button variant="outlined"
                                                                                                      onClick={() => handleAddPrompt(config.id)}
                                                                                                      startIcon={
                                                                                                          <AddIcon/>}>
                                            Add Turn
                                        </Button>)}
                                        {config.prompts.length > 1 && (<Button variant="outlined"
                                                                               onClick={() => handleRemoveLastTurn(config.id)}
                                                                               startIcon={<DeleteIcon/>}>
                                            Remove Last Turn
                                        </Button>)}
                                    </Box>)}
                                </Paper>
                            </Box>))}
                        </Box>
                        <Box sx={{mt: 2}}>
                            <Button fullWidth variant="outlined" onClick={handleAddModel} startIcon={<AddIcon/>}>
                                Add Model
                            </Button>
                        </Box>
                    </Box>
                </Panel>
                <PanelResizeHandle style={{width: '8px', background: '#f0f0f0', cursor: 'col-resize'}}/>
                <Panel defaultSize={25} minSize={20} style={{height: '100%', overflow: 'auto'}}>
                    <Box sx={{height: '100%', overflowY: 'auto', p: 2}}>
                        <Paper sx={{p: 2, mb: 2}}>
                            <Typography variant="h6" gutterBottom>Variables</Typography>
                            <List>
                                {variables.map((variable, index) => (<ListItem key={index} disablePadding sx={{mb: 2}}>
                                    <Box sx={{width: '100%', position: 'relative'}}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Name"
                                            value={variable.name}
                                            onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                                            sx={{mb: 1}}
                                        />
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            maxRows={6}
                                            label="Value"
                                            value={variable.value}
                                            onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                                        />
                                        <IconButton
                                            onClick={() => handleDeleteVariable(index)}
                                            sx={{position: 'absolute', top: 0, right: 0}}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Box>
                                </ListItem>))}
                            </List>
                            <Box mt={2} sx={{display: 'flex', justifyContent: 'space-between'}}>
                                <Button variant="outlined" onClick={handleAddVariable} startIcon={<AddIcon/>}>
                                    Add Variable
                                </Button>
                                <Button variant="outlined" onClick={openSaveVariablesDialogHandler}
                                        startIcon={<SaveIcon/>}>
                                    Save Variables
                                </Button>
                            </Box>
                        </Paper>
                        <Paper sx={{p: 2, mb: 2}}>
                            <Typography variant="h6" gutterBottom>Saved Variables</Typography>
                            <List>
                                {savedVariables.map((savedVarSet, index) => (
                                    <ListItem key={index} disablePadding sx={{mb: 1}}>
                                        <Button variant="outlined" onClick={() => loadVariables(savedVarSet)}
                                                sx={{mr: 1, flexGrow: 1}}>
                                            {savedVarSet.name}
                                        </Button>
                                        <IconButton
                                            onClick={() => removeSavedVariables(index)}><DeleteIcon/></IconButton>
                                    </ListItem>))}
                            </List>
                        </Paper>
                        <Paper sx={{p: 2}}>
                            <Typography variant="h6" gutterBottom>Model Configurations</Typography>
                            {modelConfigs.map((config) => (<Box key={config.id} sx={{mb: 2}}>
                                <FormControl fullWidth sx={{mb: 1}}>
                                    <InputLabel>Provider</InputLabel>
                                    <Select value={config.provider} label="Provider"
                                            onChange={(e) => {
                                                if (ProviderCanQueryModelList.includes(e.target.value)) {
                                                    handleMultipleModelConfigChange(config.id, {
                                                        'model': "", 'provider': e.target.value
                                                    })
                                                } else {
                                                    handleModelConfigChange(config.id, 'provider', e.target.value)
                                                }
                                            }}>
                                        <MenuItem value="openai">OpenAI</MenuItem>
                                        <MenuItem value="llamaedge">LlamaEdge</MenuItem>
                                        <MenuItem value="anthropic">Anthropic</MenuItem>
                                        <MenuItem value="azure">Azure OpenAI</MenuItem>
                                        <MenuItem value="bedrock">Amazon Bedrock</MenuItem>
                                    </Select>
                                </FormControl>
                                {config.provider === 'azure' && (<>
                                    <TextField fullWidth size="small" label="Resource Name"
                                               value={config.resourceName || ''} sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'resourceName', e.target.value)}
                                    />
                                    <TextField fullWidth size="small" label="Deployment ID"
                                               value={config.deploymentId || ''} sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'deploymentId', e.target.value)}
                                    />
                                </>)}

                                {config.provider === 'bedrock' && (<>
                                    <TextField fullWidth size="small" label="Region"
                                               value={config.region || ''} sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'region', e.target.value)}
                                    />
                                    <TextField fullWidth size="small" label="Model ID"
                                               value={config.modelId || ''} sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'modelId', e.target.value)}
                                    />
                                </>)}

                                {ProviderCanQueryModelList.includes(config.provider) ? <>
                                    <TextField fullWidth size="small" label="Endpoint"
                                               value={config.endpoint}
                                               sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'endpoint', e.target.value)}
                                    />
                                    <TextField fullWidth size="small" label="API Key" value={config.apiKey}
                                               sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'apiKey', e.target.value)}
                                               type="password"
                                    />
                                    <FormControl fullWidth sx={{mb: 1}}>
                                        <InputLabel>Model</InputLabel>
                                        <Select value={config.model} label="Provider"
                                                onChange={(e) => handleModelConfigChange(config.id, 'model', e.target.value)}>
                                            {modelsList[config.id] ? modelsList[config.id].map(model => <MenuItem
                                                value={model}>{model}</MenuItem>) : ""}
                                        </Select>
                                    </FormControl>
                                </> : <TextField fullWidth size="small" label="Model" value={config.model}
                                                 sx={{mb: 1}}
                                                 onChange={(e) => handleModelConfigChange(config.id, 'model', e.target.value)}
                                />}

                                {!ProviderCanQueryModelList.includes(config.provider) ? <>
                                    <TextField fullWidth size="small" label="API Key" value={config.apiKey}
                                               sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'apiKey', e.target.value)}
                                               type="password"
                                    />
                                    <TextField fullWidth size="small" label="Endpoint"
                                               value={config.endpoint}
                                               sx={{mb: 1}}
                                               onChange={(e) => handleModelConfigChange(config.id, 'endpoint', e.target.value)}
                                    />
                                </> : ""}
                                <TextField fullWidth size="small" label="Max Tokens" type="number"
                                           value={config.maxTokens} sx={{mb: 1}}
                                           onChange={(e) => handleModelConfigChange(config.id, 'maxTokens', parseInt(e.target.value))}
                                />
                                <Typography gutterBottom>Temperature: {config.temperature}</Typography>
                                <Slider
                                    value={config.temperature}
                                    onChange={(e, newValue) => handleModelConfigChange(config.id, 'temperature', newValue)}
                                    min={0} max={1} step={0.1}
                                />
                                <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                                    <Button variant="outlined" onClick={() => handleDeleteModel(config.id)}
                                            startIcon={<DeleteIcon/>}>
                                        Remove
                                    </Button>
                                    <Button variant="outlined"
                                            onClick={() => openSaveModelDialogHandler(config)}
                                            startIcon={<SaveIcon/>}>
                                        Save Model
                                    </Button>
                                </Box>
                            </Box>))}

                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="saved-models-content"
                                    id="saved-models-header"
                                >
                                    <Typography>Saved Models</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {savedModels.map((savedModel, index) => (<Box key={index} sx={{mb: 2}}>
                                        <Typography variant="subtitle1">{savedModel.name}</Typography>
                                        <Typography>Provider: {savedModel.config.provider}</Typography>
                                        <Typography>Model: {savedModel.config.model}</Typography>
                                        <Typography>Temperature: {savedModel.config.temperature}</Typography>
                                        <Typography>Max Tokens: {savedModel.config.maxTokens}</Typography>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                                            <Button variant="outlined" onClick={() => loadModel(savedModel)}>
                                                Load Model
                                            </Button>
                                            <Button variant="outlined" onClick={() => removeSavedModel(index)}
                                                    startIcon={<DeleteIcon/>}>
                                                Remove
                                            </Button>
                                        </Box>
                                    </Box>))}
                                </AccordionDetails>
                            </Accordion>
                        </Paper>
                    </Box>
                </Panel>
            </PanelGroup>
        </Box>
        <AppBar position="static" color="default" sx={{top: 'auto', bottom: 0}}>
            <Toolbar>
                <FormControl sx={{minWidth: 120, mr: 2}}>
                    <InputLabel>Review Model</InputLabel>
                    <Select
                        value={selectedReviewModel}
                        label="Review Model"
                        onChange={(e) => setSelectedReviewModel(e.target.value)}
                    >
                        {savedModels.map((model, index) => (
                            <MenuItem key={index} value={model.name}>{model.name}</MenuItem>))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={reviewPrompt} disabled={!selectedReviewModel}>
                    Review Prompt
                </Button>
                <Typography sx={{ml: 2, flexGrow: 1}}>{promptReviewSuggestion}</Typography>
                <Button variant="contained" onClick={saveConversationData} startIcon={<DownloadIcon/>}>
                    Save Conversation
                </Button>
            </Toolbar>
        </AppBar>
        <Dialog open={openSavePromptDialog} onClose={() => setOpenSavePromptDialog(false)}>
            <DialogTitle>Save Prompt</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Prompt Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={promptNameToSave}
                    onChange={(e) => setPromptNameToSave(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenSavePromptDialog(false)}>Cancel</Button>
                <Button onClick={savePrompt}>Save</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={openSaveModelDialog} onClose={() => setOpenSaveModelDialog(false)}>
            <DialogTitle>Save Model Configuration</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Model Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={modelNameToSave}
                    onChange={(e) => setModelNameToSave(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenSaveModelDialog(false)}>Cancel</Button>
                <Button onClick={saveModel}>Save</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={openSaveVariablesDialog} onClose={() => setOpenSaveVariablesDialog(false)}>
            <DialogTitle>Save Variables</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Variables Set Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={variablesNameToSave}
                    onChange={(e) => setVariablesNameToSave(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenSaveVariablesDialog(false)}>Cancel</Button>
                <Button onClick={saveVariables}>Save</Button>
            </DialogActions>
        </Dialog>
    </Box>);
}

export default App;