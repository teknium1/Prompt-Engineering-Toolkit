import React, { useState, useEffect } from 'react';
import { 
  Paper, TextField, Button, Typography, 
  List, ListItem, IconButton, Box, Select, MenuItem, FormControl, InputLabel, Slider, Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, FormControlLabel, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

function App() {
  const [modelConfigs, setModelConfigs] = useState([
    { 
      id: Date.now(), 
      provider: 'openai', 
      model: 'gpt-3.5-turbo', 
      temperature: 0.7, 
      apiKey: '', 
      endpoint: 'https://api.openai.com/v1/chat/completions',
      prompts: [{ id: Date.now(), text: '', output: '' }]
    }
  ]);
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
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [useGlobalPrompt, setUseGlobalPrompt] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('savedPrompts');
    if (saved) setSavedPrompts(JSON.parse(saved));
    const savedModelsData = localStorage.getItem('savedModels');
    if (savedModelsData) setSavedModels(JSON.parse(savedModelsData));
    const savedVariablesData = localStorage.getItem('savedVariables');
    if (savedVariablesData) setSavedVariables(JSON.parse(savedVariablesData));
  }, []);

  const handleAddVariable = () => setVariables([...variables, { name: '', value: '' }]);

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const handleDeleteVariable = (index) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
  };

  const handleModelConfigChange = (id, field, value) => {
    const newConfigs = modelConfigs.map(config => 
      config.id === id ? {...config, [field]: value} : config
    );
    setModelConfigs(newConfigs);
  };

  const handleAddModel = () => {
    const newModel = { 
      id: Date.now(), 
      provider: 'openai', 
      model: 'gpt-3.5-turbo', 
      temperature: 0.7, 
      apiKey: '', 
      endpoint: 'https://api.openai.com/v1/chat/completions',
      prompts: [{ id: Date.now(), text: '', output: '' }]
    };
    setModelConfigs([...modelConfigs, newModel]);
  };

  const handleDeleteModel = (id) => {
    const newConfigs = modelConfigs.filter(config => config.id !== id);
    setModelConfigs(newConfigs);
  };

  const handleAddPrompt = (modelId) => {
    const newConfigs = modelConfigs.map(config => {
      if (config.id === modelId) {
        return {
          ...config,
          prompts: [...config.prompts, { id: Date.now(), text: '', output: '' }]
        };
      }
      return config;
    });
    setModelConfigs(newConfigs);
  };

  const handlePromptChange = (modelId, promptId, value) => {
    const newConfigs = modelConfigs.map(config => {
      if (config.id === modelId) {
        return {
          ...config,
          prompts: config.prompts.map(prompt => 
            prompt.id === promptId ? {...prompt, text: value} : prompt
          )
        };
      }
      return config;
    });
    setModelConfigs(newConfigs);
  };

  const handleDeletePrompt = (modelId, promptId) => {
    const newConfigs = modelConfigs.map(config => {
      if (config.id === modelId) {
        return {
          ...config,
          prompts: config.prompts.filter(prompt => prompt.id !== promptId)
        };
      }
      return config;
    });
    setModelConfigs(newConfigs);
  };

  const openSavePromptDialogHandler = (modelId, promptId) => {
    setPromptToSave({ modelId, promptId });
    setPromptNameToSave('');
    setOpenSavePromptDialog(true);
  };

  const savePrompt = () => {
    if (promptNameToSave) {
      let promptContent;
      if (useGlobalPrompt) {
        promptContent = globalPrompt;
      } else if (promptToSave) {
        const { modelId, promptId } = promptToSave;
        const model = modelConfigs.find(m => m.id === modelId);
        const prompt = model.prompts.find(p => p.id === promptId);
        promptContent = prompt.text;
      }
      const newSavedPrompts = [...savedPrompts, { name: promptNameToSave, content: promptContent }];
      setSavedPrompts(newSavedPrompts);
      localStorage.setItem('savedPrompts', JSON.stringify(newSavedPrompts));
      setOpenSavePromptDialog(false);
    }
  };

  const loadPrompt = (savedPrompt) => {
    if (useGlobalPrompt) {
      setGlobalPrompt(savedPrompt.content);
    } else {
      const newConfigs = modelConfigs.map(config => ({
        ...config,
        prompts: config.prompts.map(prompt => ({ ...prompt, text: savedPrompt.content }))
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
      const newSavedModels = [...savedModels, { name: modelNameToSave, config: modelToSaveWithoutId }];
      setSavedModels(newSavedModels);
      localStorage.setItem('savedModels', JSON.stringify(newSavedModels));
      setOpenSaveModelDialog(false);
    }
  };

  const loadModel = (savedModel, modelId) => {
    const newConfigs = modelConfigs.map(config => {
      if (config.id === modelId) {
        return {
          ...config,
          ...savedModel.config,
          id: config.id,
          prompts: config.prompts
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
      const newSavedVariables = [...savedVariables, { name: variablesNameToSave, variables: variables }];
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

  const handleGlobalPromptChange = (event) => {
    setGlobalPrompt(event.target.value);
  };

  const toggleGlobalPrompt = () => {
    setUseGlobalPrompt(!useGlobalPrompt);
  };

  const runPrompt = async (modelId, promptId) => {
    const model = modelConfigs.find(m => m.id === modelId);
    const prompt = model.prompts.find(p => p.id === promptId);
    let processedPrompt = useGlobalPrompt ? globalPrompt : prompt.text;
    variables.forEach(v => {
      const regex = new RegExp(`\\{${v.name}\\}`, 'g');
      processedPrompt = processedPrompt.replace(regex, v.value);
    });

    try {
      let response;
      if (model.provider === 'openai') {
        response = await axios.post(model.endpoint, {
          model: model.model,
          messages: [{ role: 'user', content: processedPrompt }],
          temperature: model.temperature,
        }, {
          headers: { 'Authorization': `Bearer ${model.apiKey}` }
        });
        const output = response.data.choices[0].message.content;
        setModelConfigs(prevConfigs => prevConfigs.map(config => {
          if (config.id === modelId) {
            return {
              ...config,
              prompts: config.prompts.map(p => 
                p.id === promptId ? {...p, output} : p
              )
            };
          }
          return config;
        }));
      } else if (model.provider === 'anthropic') {
        // Implement Anthropic API call here
      }
    } catch (error) {
      console.error('Error calling API:', error);
      const errorOutput = `Error: ${error.message}`;
      setModelConfigs(prevConfigs => prevConfigs.map(config => {
        if (config.id === modelId) {
          return {
            ...config,
            prompts: config.prompts.map(p => 
              p.id === promptId ? {...p, output: errorOutput} : p
            )
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom sx={{ p: 2 }}>Prompt Engineering Tool</Typography>
      <PanelGroup direction="horizontal" style={{ flexGrow: 1 }}>
        <Panel defaultSize={20} minSize={15}>
          <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>Saved Prompts</Typography>
            <List>
              {savedPrompts.map((savedPrompt, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                  <Button variant="outlined" onClick={() => loadPrompt(savedPrompt)} sx={{ mr: 1, flexGrow: 1 }}>
                    {savedPrompt.name}
                  </Button>
                  <IconButton onClick={() => removeSavedPrompt(index)}><DeleteIcon /></IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Panel>
        <PanelResizeHandle style={{ width: '8px', background: '#f0f0f0', cursor: 'col-resize' }} />
        <Panel>
          <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <FormControlLabel
                control={<Switch checked={useGlobalPrompt} onChange={toggleGlobalPrompt} />}
                label="Use Global Prompt"
              />
              {useGlobalPrompt && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Global Prompt"
                  value={globalPrompt}
                  onChange={handleGlobalPromptChange}
                  variant="outlined"
                  sx={{ mt: 2, mb: 2 }}
                />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button variant="contained" onClick={runAllPrompts} disabled={!useGlobalPrompt}>
                  Run Global Prompt
                </Button>
                <Button variant="outlined" onClick={() => openSavePromptDialogHandler(null, null)} disabled={!useGlobalPrompt}>
                  Save Global Prompt
                </Button>
              </Box>
            </Paper>
            <Grid container spacing={2}>
              {modelConfigs.map((config) => (
                <Grid item xs={12} md={6} lg={4} key={config.id}>
                  <Paper sx={{ p: 2, mb: 2, height: '100%' }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
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
                        {savedModels.map((savedModel, index) => (
                          <MenuItem key={index} value={savedModel.name}>{savedModel.name}</MenuItem>))}
                          </Select>
                        </FormControl>
                        {useGlobalPrompt ? (
                          <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            maxRows={20}
                            label="Output"
                            value={config.prompts[0]?.output || ''}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <>
                            {config.prompts.map((prompt) => (
                              <Box key={prompt.id} sx={{ mb: 2 }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={4}
                                  maxRows={8}
                                  label="Enter your prompt"
                                  value={prompt.text}
                                  onChange={(e) => handlePromptChange(config.id, prompt.id, e.target.value)}
                                  variant="outlined"
                                  sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                  <Button variant="contained" onClick={() => runPrompt(config.id, prompt.id)}>
                                    Run Prompt
                                  </Button>
                                  <Button variant="outlined" onClick={() => openSavePromptDialogHandler(config.id, prompt.id)}>
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
                                  InputProps={{ readOnly: true }}
                                  sx={{ mb: 2 }}
                                />
                                <Button variant="outlined" onClick={() => handleDeletePrompt(config.id, prompt.id)} startIcon={<DeleteIcon />}>
                                  Remove Prompt
                                </Button>
                              </Box>
                            ))}
                            <Button variant="outlined" onClick={() => handleAddPrompt(config.id)} startIcon={<AddIcon />}>
                              Add Prompt
                            </Button>
                          </>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button fullWidth variant="outlined" onClick={handleAddModel} startIcon={<AddIcon />}>
                    Add Model
                  </Button>
                </Box>
              </Box>
            </Panel>
            <PanelResizeHandle style={{ width: '8px', background: '#f0f0f0', cursor: 'col-resize' }} />
            <Panel defaultSize={25} minSize={20}>
              <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Variables</Typography>
                  <List>
                    {variables.map((variable, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                        <Box sx={{ width: '100%', position: 'relative' }}>
                          <TextField 
                            fullWidth
                            size="small" 
                            label="Name" 
                            value={variable.name}
                            onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                            sx={{ mb: 1 }}
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
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                  <Box mt={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" onClick={handleAddVariable} startIcon={<AddIcon />}>
                      Add Variable
                    </Button>
                    <Button variant="outlined" onClick={openSaveVariablesDialogHandler} startIcon={<SaveIcon />}>
                      Save Variables
                    </Button>
                  </Box>
                </Paper>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Saved Variables</Typography>
                  <List>
                    {savedVariables.map((savedVarSet, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <Button variant="outlined" onClick={() => loadVariables(savedVarSet)} sx={{ mr: 1, flexGrow: 1 }}>
                          {savedVarSet.name}
                        </Button>
                        <IconButton onClick={() => removeSavedVariables(index)}><DeleteIcon /></IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Model Configurations</Typography>
                  {modelConfigs.map((config) => (
                    <Box key={config.id} sx={{ mb: 2 }}>
                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel>Provider</InputLabel>
                        <Select value={config.provider} label="Provider"
                          onChange={(e) => handleModelConfigChange(config.id, 'provider', e.target.value)}>
                          <MenuItem value="openai">OpenAI</MenuItem>
                          <MenuItem value="anthropic">Anthropic</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField fullWidth size="small" label="Model" value={config.model} sx={{ mb: 1 }}
                        onChange={(e) => handleModelConfigChange(config.id, 'model', e.target.value)}
                      />
                      <TextField fullWidth size="small" label="API Key" value={config.apiKey} sx={{ mb: 1 }}
                        onChange={(e) => handleModelConfigChange(config.id, 'apiKey', e.target.value)}
                        type="password"
                      />
                      <TextField fullWidth size="small" label="Endpoint" value={config.endpoint} sx={{ mb: 1 }}
                        onChange={(e) => handleModelConfigChange(config.id, 'endpoint', e.target.value)}
                      />
                      <Typography gutterBottom>Temperature: {config.temperature}</Typography>
                      <Slider
                        value={config.temperature}
                        onChange={(e, newValue) => handleModelConfigChange(config.id, 'temperature', newValue)}
                        min={0} max={1} step={0.1}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Button variant="outlined" onClick={() => handleDeleteModel(config.id)} startIcon={<DeleteIcon />}>
                          Remove
                        </Button>
                        <Button variant="outlined" onClick={() => openSaveModelDialogHandler(config)} startIcon={<SaveIcon />}>
                          Save Model
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Box>
            </Panel>
          </PanelGroup>
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
        </Box>
      );
    }
    
    export default App;