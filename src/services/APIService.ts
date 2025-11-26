// src/services/APIService.ts

export interface APIResponse {
  success: boolean;
  content: string;
  error?: string;
  cost?: number;
  tokens?: number;
}

export interface APIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class APIService {
  // Cache für verfügbare Modelle
  private static modelCache: Map<string, { models: any[], lastUpdated: number }> = new Map();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Stunden

  // Automatische Modell-Mappings (werden dynamisch aktualisiert)
  private static modelMappings: Record<string, string> = {
    // Fallback-Mappings für veraltete Modelle → Auto-Update Aliases
    'claude-3-sonnet-20240229': 'claude-sonnet-4-5',
    'claude-3-5-sonnet-20241022': 'claude-sonnet-4-5', // Alt → Neu
    'claude-3-opus-20240229': 'claude-opus-4-1',
    'claude-3-haiku-20240307': 'claude-haiku-4-5',
    'claude-3-5-haiku-20241022': 'claude-haiku-4-5',
    'claude-2.1': 'claude-sonnet-4-5',
    'claude-2': 'claude-sonnet-4-5',
    'gpt-4-turbo-preview': 'gpt-4-turbo',
    'gpt-4-1106-preview': 'gpt-4-turbo'
  };

  // Basis-Token-Kosten (werden dynamisch aktualisiert)
  private static tokenCosts: Record<string, { input: number; output: number }> = {
    'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
    'claude-opus-4-1': { input: 15.00, output: 75.00 },
    'claude-haiku-4-5': { input: 0.25, output: 1.25 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 }
  };

  /**
   * Lädt verfügbare Modelle dynamisch von der API
   */
  static async fetchAvailableModels(provider: string, apiKey: string): Promise<any[]> {
    try {
      const cacheKey = `${provider}_${apiKey.slice(-8)}`;
      const cached = this.modelCache.get(cacheKey);
      
      // Cache prüfen
      if (cached && (Date.now() - cached.lastUpdated) < this.CACHE_DURATION) {
        return cached.models;
      }

      let models: any[] = [];

      if (provider === 'anthropic') {
        models = await this.fetchAnthropicModels(apiKey);
      } else if (provider === 'openai') {
        models = await this.fetchOpenAIModels(apiKey);
      } else {
        // Fallback auf statische Liste
        models = this.getStaticModels(provider);
      }

      // Cache aktualisieren
      this.modelCache.set(cacheKey, {
        models,
        lastUpdated: Date.now()
      });

      return models;
    } catch (error) {
      console.warn('Fehler beim Laden der Modelle, verwende statische Liste:', error);
      return this.getStaticModels(provider);
    }
  }

  /**
   * Lädt Anthropic-Modelle dynamisch
   */
  private static async fetchAnthropicModels(apiKey: string): Promise<any[]> {
    // Using auto-update aliases that always point to latest versions
    const knownModels = [
      {
        id: 'claude-sonnet-4-5',
        name: 'Claude Sonnet 4.5 (Auto-Latest)',
        maxTokens: 200000,
        cost: 0.003
      },
      {
        id: 'claude-haiku-4-5',
        name: 'Claude Haiku 4.5 (Auto-Latest)',
        maxTokens: 200000,
        cost: 0.00015
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus (Powerful)',
        maxTokens: 4096,
        cost: 0.015
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku (Legacy)',
        maxTokens: 4096,
        cost: 0.001
      }
    ];

    // Für Anthropic verwenden wir die bekannten Modelle ohne Test (um Endlosschleife zu vermeiden)
    // Da Anthropic keine öffentliche Models-API hat, nehmen wir alle bekannten Modelle als verfügbar an
    return knownModels;
  }

  /**
   * Lädt OpenAI-Modelle dynamisch
   */
  private static async fetchOpenAIModels(apiKey: string): Promise<any[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Filtere nur Chat-Modelle und füge Metadaten hinzu
      const chatModels = data.data
        .filter((model: any) => 
          model.id.includes('gpt-4') || 
          model.id.includes('gpt-3.5-turbo') ||
          model.id.includes('gpt-4o')
        )
        .map((model: any) => ({
          id: model.id,
          name: this.formatModelName(model.id),
          maxTokens: this.getModelMaxTokens(model.id),
          cost: this.getModelCost(model.id)
        }))
        .sort((a: any, b: any) => b.cost - a.cost); // Sortiere nach Kosten (teuer zuerst)

      return chatModels;
    } catch (error) {
      console.warn('OpenAI Models API fehler:', error);
      return this.getStaticModels('openai');
    }
  }

  /**
   * Testet ob ein Modell verfügbar ist
   */
  private static async testModelAvailability(provider: string, model: string, apiKey: string): Promise<boolean> {
    try {
      const testMessages = [{ role: 'user' as const, content: 'test' }];
      const result = await this.callAPI(provider, model, apiKey, testMessages, 5, true); // skipModelUpdate = true
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Statische Fallback-Modelle
   */
  private static getStaticModels(provider: string): any[] {
    if (provider === 'anthropic') {
      return [
        { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5 (Auto-Latest)', maxTokens: 200000, cost: 0.003 },
        { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5 (Auto-Latest)', maxTokens: 200000, cost: 0.00015 },
        { id: 'claude-opus-4-1', name: 'Claude Opus 4.1 (Auto-Latest)', maxTokens: 200000, cost: 0.015 }
      ];
    } else if (provider === 'openai') {
      return [
        { id: 'gpt-4o', name: 'GPT-4o (Latest)', maxTokens: 4096, cost: 0.005 },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 4096, cost: 0.01 },
        { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, cost: 0.03 },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, cost: 0.001 }
      ];
    }
    return [];
  }

  /**
   * Formatiert Modellnamen für bessere Lesbarkeit
   */
  private static formatModelName(modelId: string): string {
    const names: Record<string, string> = {
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-4-turbo-preview': 'GPT-4 Turbo Preview',
      'gpt-4-0125-preview': 'GPT-4 Turbo (Jan 2024)',
      'gpt-4-1106-preview': 'GPT-4 Turbo (Nov 2023)',
      'gpt-4': 'GPT-4',
      'gpt-4-0613': 'GPT-4 (June 2023)',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-3.5-turbo-0125': 'GPT-3.5 Turbo (Jan 2024)',
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini'
    };
    return names[modelId] || modelId;
  }

  /**
   * Ermittelt maximale Token für Modell
   */
  private static getModelMaxTokens(modelId: string): number {
    const tokenLimits: Record<string, number> = {
      'gpt-4-turbo': 4096,
      'gpt-4': 8192,
      'gpt-3.5-turbo': 4096,
      'gpt-4o': 4096,
      'gpt-4o-mini': 16384
    };
    return tokenLimits[modelId] || 4096;
  }

  /**
   * Ermittelt Kosten pro Token für Modell
   */
  private static getModelCost(modelId: string): number {
    const costs: Record<string, number> = {
      'gpt-4-turbo': 0.01,
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.001,
      'gpt-4o': 0.005,
      'gpt-4o-mini': 0.0001
    };
    return costs[modelId] || 0.01;
  }

  /**
   * Aktualisiert Modell-Mappings für veraltete Modelle
   */
  static updateModelMappings(availableModels: any[]): void {
    const activeModelIds = availableModels.map(m => m.id);
    
    // Überprüfe und aktualisiere Mappings
    for (const [oldModel, currentMapping] of Object.entries(this.modelMappings)) {
      if (!activeModelIds.includes(currentMapping)) {
        // Finde alternatives Modell
        const alternative = this.findBestAlternative(oldModel, availableModels);
        if (alternative) {
          this.modelMappings[oldModel] = alternative.id;
          console.log(`Modell-Mapping aktualisiert: ${oldModel} -> ${alternative.id}`);
        }
      }
    }
  }

  /**
   * Findet beste Alternative für veraltetes Modell
   */
  private static findBestAlternative(oldModel: string, availableModels: any[]): any | null {
    // Intelligente Modell-Zuordnung basierend auf Namen
    if (oldModel.includes('claude')) {
      return availableModels.find(m => m.id.includes('claude-3-5-sonnet')) ||
             availableModels.find(m => m.id.includes('claude-3-opus')) ||
             availableModels.find(m => m.id.includes('claude')) ||
             availableModels[0];
    } else if (oldModel.includes('gpt-4')) {
      return availableModels.find(m => m.id.includes('gpt-4-turbo')) ||
             availableModels.find(m => m.id.includes('gpt-4')) ||
             availableModels[0];
    } else if (oldModel.includes('gpt-3.5')) {
      return availableModels.find(m => m.id.includes('gpt-3.5-turbo')) ||
             availableModels[0];
    }
    
    return availableModels[0] || null;
  }

  /**
   * Hauptmethode für API-Aufrufe (mit automatischer Modell-Aktualisierung)
   */
  static async callAPI(
    provider: string,
    model: string,
    apiKey: string,
    messages: APIMessage[],
    maxTokens: number = 4096,
    skipModelUpdate: boolean = false
  ): Promise<APIResponse> {
    try {
      // Ollama benötigt keine API-Schlüssel
      if (provider === 'ollama') {
        return await this.callOllamaAPI(model, messages, maxTokens);
      }

      // Prüfe auf verfügbare Modelle und aktualisiere Mappings (nur wenn nicht bereits in einer Rekursion)
      if (apiKey && (provider === 'openai' || provider === 'anthropic') && !skipModelUpdate) {
        try {
          const availableModels = await this.fetchAvailableModels(provider, apiKey);
          this.updateModelMappings(availableModels);
        } catch (error) {
          console.warn('Modell-Aktualisierung fehlgeschlagen:', error);
        }
      }

      // Modell-Mapping anwenden (mit automatischer Aktualisierung)
      const actualModel = this.modelMappings[model] || model;

      // Warnung wenn Modell gemappt wurde
      if (actualModel !== model) {
        console.warn(`Modell ${model} wurde automatisch auf ${actualModel} aktualisiert`);
      }

      if (provider === 'anthropic') {
        return await this.callAnthropicAPI(apiKey, actualModel, messages, maxTokens);
      } else if (provider === 'openai') {
        return await this.callOpenAIAPI(apiKey, model, messages, maxTokens);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error: any) {
      console.error('API call error:', error);
      return {
        success: false,
        content: '',
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Ollama API Aufruf
   */
  private static async callOllamaAPI(
    model: string,
    messages: APIMessage[],
    maxTokens: number
  ): Promise<APIResponse> {
    try {
      // First check if Ollama is running
      const healthCheck = await fetch('http://localhost:11434/api/version', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);

      if (!healthCheck || !healthCheck.ok) {
        console.log('Ollama health check failed, trying direct generation...');
      }

      // Prepare prompt from messages
      let prompt = '';
      messages.forEach(msg => {
        if (msg.role === 'system') {
          prompt += `System: ${msg.content}\n\n`;
        } else if (msg.role === 'user') {
          prompt += `Human: ${msg.content}\n\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n\n`;
        }
      });

      if (!prompt) {
        prompt = messages[messages.length - 1].content;
      }

      prompt += "Assistant: ";

      console.log('Calling Ollama with model:', model);

      // Call Ollama generate endpoint with longer timeout
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: maxTokens,
            stop: ["Human:", "System:"]
          }
        }),
        signal: AbortSignal.timeout(180000) // 3 minute timeout for large models and comprehensive sections
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama response error:', errorText);

        // Check if model exists
        if (errorText.includes('model') || response.status === 404) {
          throw new Error(`Model '${model}' not found. Please run: ollama pull ${model}`);
        }
        throw new Error(`Ollama error: ${errorText || response.statusText}`);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error('Invalid response from Ollama - no content returned');
      }

      console.log('Ollama response received, length:', data.response.length);

      // Estimate tokens
      const estimatedTokens = Math.ceil(data.response.split(/\s+/).length * 1.3);

      return {
        success: true,
        content: data.response,
        tokens: estimatedTokens,
        cost: 0
      };

    } catch (error: any) {
      console.error('Ollama Direct Error:', error);

      // Provide helpful error messages
      if (error.message.includes('fetch failed') || error.name === 'TypeError') {
        return {
          success: false,
          content: '',
          error: 'Ollama is not running. Please start it with: ollama serve'
        };
      } else if (error.message.includes('aborted')) {
        return {
          success: false,
          content: '',
          error: 'Request timeout - model may be loading. Please try again.'
        };
      }

      return {
        success: false,
        content: '',
        error: error.message
      };
    }
  }

  /**
   * Anthropic API Aufruf
   */
  private static async callAnthropicAPI(
    apiKey: string,
    model: string,
    messages: APIMessage[],
    maxTokens: number
  ): Promise<APIResponse> {
    // System-Message extrahieren falls vorhanden
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const requestBody: any = {
      model: model,
      max_tokens: maxTokens,
      messages: userMessages
    };

    // System-Message hinzufügen wenn vorhanden
    if (systemMessage) {
      requestBody.system = systemMessage.content;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || 
        `Anthropic API error (${response.status}): ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    
    // Token-Kosten berechnen
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costs = this.tokenCosts[model] || { input: 0, output: 0 };
    const totalCost = (inputTokens * costs.input + outputTokens * costs.output) / 1000000;

    return {
      success: true,
      content: data.content[0]?.text || '',
      cost: totalCost,
      tokens: inputTokens + outputTokens
    };
  }

  /**
   * OpenAI API Aufruf
   */
  private static async callOpenAIAPI(
    apiKey: string,
    model: string,
    messages: APIMessage[],
    maxTokens: number
  ): Promise<APIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Token-Kosten für OpenAI (beispielhaft)
    const totalTokens = data.usage?.total_tokens || 0;
    const costPerToken = model.includes('gpt-4') ? 0.00003 : 0.000002;
    
    return {
      success: true,
      content: data.choices[0]?.message?.content || '',
      cost: totalTokens * costPerToken,
      tokens: totalTokens
    };
  }

  /**
   * Validiert API-Schlüssel
   */
  static async validateAPIKey(provider: string, apiKey: string): Promise<boolean> {
    try {
      // Einfacher Test-Aufruf
      const testMessages: APIMessage[] = [
        { role: 'user', content: 'Say "OK" if you can read this.' }
      ];
      
      const result = await this.callAPI(provider, 
        provider === 'anthropic' ? 'claude-3-haiku-20240307' : 'gpt-3.5-turbo',
        apiKey, testMessages, 10
      );
      
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gibt verfügbare Modelle für einen Provider zurück (mit dynamischer Aktualisierung)
   */
  static async getAvailableModels(provider: string, apiKey?: string): Promise<{ id: string; name: string; maxTokens: number; cost?: number }[]> {
    // Wenn API-Schlüssel verfügbar, dynamisch laden
    if (apiKey && (provider === 'openai' || provider === 'anthropic')) {
      try {
        const models = await this.fetchAvailableModels(provider, apiKey);
        return models.map(model => ({
          id: model.id,
          name: model.name,
          maxTokens: model.maxTokens,
          cost: model.cost
        }));
      } catch (error) {
        console.warn('Dynamisches Laden fehlgeschlagen, verwende statische Liste:', error);
      }
    }

    // Fallback auf statische Modelle
    return this.getStaticModels(provider);
  }

  /**
   * Synchrone Methode für Backward-Kompatibilität
   */
  static getAvailableModelsSync(provider: string): { id: string; name: string; maxTokens: number }[] {
    return this.getStaticModels(provider);
  }

  /**
   * Überprüft System-Status und Model-Verfügbarkeit
   */
  static async getSystemStatus(): Promise<{
    status: 'online' | 'offline' | 'limited';
    modelUpdatesAvailable: boolean;
    lastModelCheck: number;
    deprecatedModels: string[];
    newModels: string[];
  }> {
    const now = Date.now();
    const deprecatedModels: string[] = [];
    const newModels: string[] = [];
    let modelUpdatesAvailable = false;

    try {
      // Überprüfe alle gecachten Provider
      for (const [cacheKey, cached] of this.modelCache.entries()) {
        const provider = cacheKey.split('_')[0];
        const cacheAge = now - cached.lastUpdated;

        if (cacheAge > this.CACHE_DURATION) {
          modelUpdatesAvailable = true;
        }

        // Prüfe auf veraltete Modelle
        for (const [oldModel, newModel] of Object.entries(this.modelMappings)) {
          if (oldModel !== newModel) {
            deprecatedModels.push(oldModel);
          }
        }
      }

      return {
        status: 'online',
        modelUpdatesAvailable,
        lastModelCheck: Math.max(...Array.from(this.modelCache.values()).map(c => c.lastUpdated), 0),
        deprecatedModels,
        newModels
      };
    } catch (error) {
      return {
        status: 'offline',
        modelUpdatesAvailable: false,
        lastModelCheck: 0,
        deprecatedModels,
        newModels
      };
    }
  }

  /**
   * Setzt das System zurück
   */
  static resetSystem(): void {
    this.modelCache.clear();
    console.log('System reset: Model cache cleared');
  }
}

export default APIService;