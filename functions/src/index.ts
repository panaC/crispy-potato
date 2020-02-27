import * as functions from "firebase-functions";

import { scrapIt } from "./scrapIt";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

const runtimeOpts: functions.RuntimeOptions = {
    timeoutSeconds: 60,
    memory: '1GB'
  };


export const scrap_flashscore_match = functions
    .runWith(runtimeOpts)
    .https.onRequest(
    async (request, response) => {

        const id = request.query.id;

        if (id) {
            const data = await scrapIt(id);
            response.send(data);
        } else {
            response.send({ error: 'bad ID' });
        }
    }
);