import React, { useState, useContext, useRef, useEffect } from 'react'; // Agregado useRef y useEffect
import { AppContext } from '../context/AppContext';
import { MessageCircle } from '../utils/icons';

const Chatbot = () => { // Ya no recibe onCloseModal
    const { addExpense, addOrUpdateDebt, incomeLocations, exchangeRate } = useContext(AppContext);
    const [messages, setMessages] = useState([{ type: 'ai', text: '¡Hola! Soy tu asistente financiero. Puedes pedirme que añada un gasto. Por ejemplo: "Registra 5000 ARS de alquiler". También dime si es una deuda o es recurrente.' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null); // Ref para el scroll automático

    const LLM_API_KEY = "AIzaSyAzYgna-NSQ1LSih1s6JfUu9mMF5VzhLqQ"; // Si necesitas una clave para modelos específicos, ponla aquí, sino déjala vacía.

    // Scroll automático al final de los mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { type: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Envío del mensaje al LLM para procesar el gasto
            const prompt = `El usuario dice: "${userMessage.text}". Interpreta este mensaje para extraer un único gasto o deuda.
            Debes responder exclusivamente en formato JSON, usando el siguiente esquema. Si no puedes extraer un valor, usa un valor por defecto seguro (ej: "" para texto, 0 para monto, false para booleanos, fecha actual para dueDate si es un gasto con vencimiento y no se especifica).
            Las monedas son ARS o USD. Si no se especifica, asume ARS.
            Las ubicaciones de dinero disponibles son: ${incomeLocations.map(loc => loc.name).join(', ')}. Si no se especifica, o no coincide, usa "Sin Ubicación".
            
            JSON Schema para el gasto:
            {
              "type": "object",
              "properties": {
                "description": { "type": "string", "description": "Descripción del gasto o nombre del deudor si es deuda" },
                "amount": { "type": "number", "description": "Monto del gasto o deuda." },
                "currency": { "type": "string", "enum": ["ARS", "USD"], "description": "Moneda del monto" },
                "isDebt": { "type": "boolean", "description": "True si es una deuda, false si es un gasto directo" },
                "isRecurring": { "type": "boolean", "description": "True si es un gasto recurrente, false en caso contrario" },
                "dueDate": { "type": "string", "description": "Fecha de vencimiento en formatoYYYY-MM-DD si aplica (solo para gastos no deuda)" },
                "source": { "type": "string", "description": "Ubicación de donde sale el dinero (ej. 'Galicia', 'Mercadopago'). Usar 'Sin Ubicación' si no se especifica y no es deuda." }
              },
              "required": ["description", "amount", "currency", "isDebt", "isRecurring"]
            }
            `;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            description: { type: "string" },
                            amount: { type: "string" },
                            currency: { type: "string" },
                            isDebt: { type: "boolean" },
                            isRecurring: { type: "boolean" },
                            dueDate: { type: "string" },
                            source: { type: "string" }
                        }
                    }
                }
            };

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${LLM_API_KEY}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error de la API: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                throw new Error('La IA no pudo generar una respuesta JSON válida.');
            }

            console.log("Respuesta cruda de la IA:", responseText);
            const parsedData = JSON.parse(responseText);

            console.log("Datos parseados del gasto:", parsedData);

            // Validar y normalizar los datos
            const expenseToSave = {
                description: parsedData.description || 'Gasto no especificado',
                amount: typeof parsedData.amount === 'number' && parsedData.amount > 0 ? parsedData.amount : 0,
                currency: ['ARS', 'USD'].includes(parsedData.currency?.toUpperCase()) ? parsedData.currency.toUpperCase() : 'ARS',
                isDebt: typeof parsedData.isDebt === 'boolean' ? parsedData.isDebt : false,
                isRecurring: typeof parsedData.isRecurring === 'boolean' ? parsedData.isRecurring : false,
                dueDate: parsedData.dueDate || '',
                source: incomeLocations.some(loc => loc.name === parsedData.source) ? parsedData.source : 'Sin Ubicación', // Asigna 'Sin Ubicación' si no existe
                date: new Date().toISOString(), // Fecha de registro
                isPaid: false // Por defecto, los gastos añadidos por chat son pendientes
            };

            if (expenseToSave.isDebt) {
                await addOrUpdateDebt(expenseToSave.description, expenseToSave.amount, expenseToSave.currency);
                setMessages((prev) => [...prev, { type: 'ai', text: `¡Deuda "${expenseToSave.description}" de ${expenseToSave.amount} ${expenseToSave.currency} actualizada/añadida!` }]);
            } else {
                await addExpense(expenseToSave);
                setMessages((prev) => [...prev, { type: 'ai', text: `¡Gasto "${expenseToSave.description}" de ${expenseToSave.amount} ${expenseToSave.currency} registrado!` }]);
            }

        } catch (error) {
            console.error("Error al comunicarse con la IA o al guardar el gasto:", error);
            setMessages((prev) => [
                ...prev,
                { type: 'ai', text: 'Lo siento, no pude procesar tu solicitud. Asegúrate de especificar el monto y la descripción.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-direct-container">
            <h3 className="chatbot-header">Asistente de Gastos <MessageCircle className="chatbot-icon"/></h3>
            <div className="chat-messages-container">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}>
                        {msg.text}
                    </div>
                ))}
                {isLoading && <div className="chat-loading">Escribiendo...</div>}
                <div ref={messagesEndRef} /> {/* Elemento vacío para el scroll */}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ej: Registrar 12000 ARS de alquiler"
                    className="chat-input"
                    disabled={isLoading}
                />
                <button type="submit" className="chat-send-button" disabled="true"/*{isLoading}*/>
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default Chatbot;