const dialogflow = require('@google-cloud/dialogflow');

/**
 * Перенаправляем сообщение клиента к dialogflow
 * В ответ возвращаем сообщение
 */
exports.process = async function(client, message) {
    const projectId = "akbarsik-99ax";

    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, client.session_id);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'ru-RU',
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.debug('Detected intent');
    const result = responses[0].queryResult;

    console.debug(`  Query: ${result.queryText}`);
    console.debug(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.debug(`  Intent: ${result.intent.displayName}`);
    } else {
        console.debug(`  No intent matched.`);
    }

    return result.fulfillmentText;
}