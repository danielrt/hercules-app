import OpenAI from 'openai';


export class HerculesOpenAI {

    constructor() {
        this.openaiClient = new OpenAI({ apiKey : "", dangerouslyAllowBrowser: true });
        this.openaiHistory = [
            { 
                role: 'system', 
                content: 'Você se chama Hércules e é o operador virtual de uma empilhadeira \
                        no armazém da empresa. O armazém possui corredores, numerados de 1 a 5. \
                        Cada corredor possui espaços demarcados para \
                        pilhas de cargas, numerados de 1 a 10. No armazém existe um caminhão \
                        que precisa ser carregado ou descarregado. Você deve seguir as orientações para comandar a \
                        empilhadeira. Para isso, você tem a possibilidade de invocar os comandos a seguir:\n \
                        CARREGAR(x, y): leva a carga do corredor x no topo da pilha y para o caminhão;\n \
                        DESCARREGAR(x, y): leva a carga do caminhão para o corredor x na pilha y;\n \
                        \n \
                        Caso a fala do usuário não seja um comando, responda normalmente.\n \
                        \n \
                        Caso a fala do usuário contenha um comando, você deve responder da seguinte forma:\n \
                        RESPOSTA AO USUÁRIO: resposta falada ao usuário antes de executar o comando\n \
                        COMANDO: comando a ser invocado\n \
                        PEDIDO DE CONFIRMAÇÃO: Deseja que o comando seja executado?\n \
                        \n \
                        Você deve invocar apenas um comando por vez.\n \
                        \n \
                        Em caso de confirmação do comando pelo usuário, responda apenas:\n \
                        COMANDO: comando a ser executado' 
            }
        ]
    }

    async askHercules(question) {
        var aiQuestionHistoryItem = {
            role: 'user', content: question
        }
        this.openaiHistory.push(aiQuestionHistoryItem);

        const chatCompletion = await this.openaiClient.chat.completions.create({
            messages: this.openaiHistory,
            model: 'gpt-4o-mini',
        });

        var aiAnswer = chatCompletion.choices[0].message.content;
        console.log("aiAnswer = ");
        console.log(aiAnswer);
        var aiAnswerHistoryItem = {
            role: 'assistant', content: aiAnswer
        }
        this.openaiHistory.push(aiAnswerHistoryItem);

        // Regex patterns to identify components for both formats
        const patternCommand = /COMANDO: (.*)/;
        const patternUserAnswer = /RESPOSTA AO USUÁRIO: (.*)/;
        const patternConfirmationRequest = /PEDIDO DE CONFIRMAÇÃO: (.*)/;

        var answerObj = {
            userResponse : "",
            command : "",
            confirmationRequest : ""
        }

        let isFormatedAnswer = false;

        // Check if the text matches Format 1
        let userResponse = patternUserAnswer.exec(aiAnswer);
        if (userResponse) {
            answerObj.userResponse = userResponse[1];
            isFormatedAnswer = true;
            console.log("userResponse = ");
            console.log(userResponse);
        }

        // Check if the text matches Format 1
        let command = patternCommand.exec(aiAnswer);
        if (command) {
            answerObj.command = command[1];
            isFormatedAnswer = true;
            console.log("command = ");
            console.log(command);
        }

        // Check if the text matches Format 1
        let confirmationRequest = patternConfirmationRequest.exec(aiAnswer);
        if (confirmationRequest) {
            answerObj.confirmationRequest = confirmationRequest[1];
            isFormatedAnswer = true;
            console.log("confirmationRequest = ");
            console.log(confirmationRequest);
        }

        if(!isFormatedAnswer) {
            console.log("userResponse = ");
            console.log(aiAnswer);
            answerObj.userResponse = aiAnswer;
        }

        var finalText = answerObj.userResponse.concat("\n", answerObj.command, "\n", answerObj.confirmationRequest);
        console.log("finalText = ");
        console.log(finalText);

        return finalText;
    }
}