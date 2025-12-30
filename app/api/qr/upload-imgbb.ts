// pages/api/upload-imgbb.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        const { base64 } = req.body;
        if (!base64) return res.status(400).json({ error: 'No base64 provided' });

        const base64Data = base64.split(',')[1];
        const API_KEY = process.env.IMGBBAPIKEY || '2bf7decd9301679a14e5405b4049fe6b';
        if (!API_KEY) return res.status(500).json({ error: 'Server missing IMGBBAPIKEY' });

        const formData = new (global as any).FormData();
        formData.append('key', API_KEY);
        formData.append('image', base64Data);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData as any
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText });
        }

        const data = await response.json();
        return res.status(200).json({ url: data.data.url });
    } catch (err) {
        console.error('upload error', err);
        return res.status(500).json({ error: 'Upload failed' });
    }
}
