export const uploadImageToImgBB = async (base64Image: string) => {
    const base64Data = base64Image.split(',')[1];
    const API_KEY = process.env.NEXT_PUBLIC_IMGBB_APIKEY || "2bf7decd9301679a14e5405b4049fe6b";

    const formData = new FormData();
    formData.append('key', API_KEY);
    formData.append('image', base64Data);

    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ImgBB upload failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.data.url as string;
};