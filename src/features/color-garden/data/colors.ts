export interface ColorData {
    id: string;
    nameEn: string;
    nameZh: string;
    zhuyin: { char: string; onset?: string; rime?: string; tone?: string }[];
    hex: string;
    audio: string;
    tags: ('warm' | 'cool' | 'light' | 'dark' | 'neutral')[];
    hueOrder: number; // For Hue Wheel sorting
    rainbowOrder?: number; // For Rainbow sorting
    brightness: number; // 0-100 (Dark -> Light)
    temperature: number; // 0-100 (Cool -> Warm)
}

export const COLORS: ColorData[] = [
    {
        id: 'red',
        nameEn: 'Red',
        nameZh: '紅',
        zhuyin: [{ char: '紅', onset: 'ㄏ', rime: 'ㄨㄥ', tone: 'ˊ' }],
        hex: '#FF0000',
        audio: '/audio/colors/red.mp3',
        tags: ['warm', 'dark'],
        hueOrder: 1,
        rainbowOrder: 1,
        brightness: 50,
        temperature: 90
    },
    {
        id: 'orange',
        nameEn: 'Orange',
        nameZh: '橘',
        zhuyin: [{ char: '橘', onset: 'ㄐ', rime: 'ㄩ', tone: 'ˊ' }],
        hex: '#FFA500',
        audio: '/audio/colors/orange.mp3',
        tags: ['warm', 'light'],
        hueOrder: 2,
        rainbowOrder: 2,
        brightness: 70,
        temperature: 80
    },
    {
        id: 'yellow',
        nameEn: 'Yellow',
        nameZh: '黃',
        zhuyin: [{ char: '黃', onset: 'ㄏ', rime: 'ㄨㄤ', tone: 'ˊ' }],
        hex: '#FFFF00',
        audio: '/audio/colors/yellow.mp3',
        tags: ['warm', 'light'],
        hueOrder: 3,
        rainbowOrder: 3,
        brightness: 90,
        temperature: 70
    },
    {
        id: 'green',
        nameEn: 'Green',
        nameZh: '綠',
        zhuyin: [{ char: '綠', onset: 'ㄌ', rime: 'ㄩ', tone: 'ˋ' }],
        hex: '#008000',
        audio: '/audio/colors/green.mp3',
        tags: ['cool', 'dark'],
        hueOrder: 4,
        rainbowOrder: 4,
        brightness: 50,
        temperature: 40
    },
    {
        id: 'blue',
        nameEn: 'Blue',
        nameZh: '藍',
        zhuyin: [{ char: '藍', onset: 'ㄌ', rime: 'ㄢ', tone: 'ˊ' }],
        hex: '#0000FF',
        audio: '/audio/colors/blue.mp3',
        tags: ['cool', 'dark'],
        hueOrder: 6,
        rainbowOrder: 5,
        brightness: 40,
        temperature: 10
    },
    {
        id: 'purple',
        nameEn: 'Purple',
        nameZh: '紫',
        zhuyin: [{ char: '紫', onset: 'ㄗ', tone: 'ˇ' }],
        hex: '#800080',
        audio: '/audio/colors/purple.mp3',
        tags: ['cool', 'dark'],
        hueOrder: 7,
        rainbowOrder: 6,
        brightness: 30,
        temperature: 20
    },
    {
        id: 'pink',
        nameEn: 'Pink',
        nameZh: '粉',
        zhuyin: [{ char: '粉', onset: 'ㄈ', rime: 'ㄣ', tone: 'ˇ' }],
        hex: '#FFC0CB',
        audio: '/audio/colors/pink.mp3',
        tags: ['warm', 'light'],
        hueOrder: 8,
        brightness: 80,
        temperature: 60
    },
    {
        id: 'brown',
        nameEn: 'Brown',
        nameZh: '咖',
        zhuyin: [{ char: '咖', onset: 'ㄎ', rime: 'ㄚ' }, { char: '啡', onset: 'ㄈ', rime: 'ㄟ' }],
        hex: '#A52A2A',
        audio: '/audio/colors/brown.mp3',
        tags: ['warm', 'dark'],
        hueOrder: 9,
        brightness: 30,
        temperature: 80
    },
    {
        id: 'black',
        nameEn: 'Black',
        nameZh: '黑',
        zhuyin: [{ char: '黑', onset: 'ㄏ', rime: 'ㄟ' }],
        hex: '#000000',
        audio: '/audio/colors/black.mp3',
        tags: ['neutral', 'dark'],
        hueOrder: 13,
        brightness: 0,
        temperature: 50
    },
    {
        id: 'white',
        nameEn: 'White',
        nameZh: '白',
        zhuyin: [{ char: '白', onset: 'ㄅ', rime: 'ㄞ', tone: 'ˊ' }],
        hex: '#FFFFFF',
        audio: '/audio/colors/white.mp3',
        tags: ['neutral', 'light'],
        hueOrder: 14,
        brightness: 100,
        temperature: 50
    },
    {
        id: 'gray',
        nameEn: 'Gray',
        nameZh: '灰',
        zhuyin: [{ char: '灰', onset: 'ㄏ', rime: 'ㄨㄟ' }],
        hex: '#808080',
        audio: '/audio/colors/gray.mp3',
        tags: ['neutral', 'dark'],
        hueOrder: 15,
        brightness: 50,
        temperature: 50
    },
    {
        id: 'light_blue',
        nameEn: 'Light Blue',
        nameZh: '淺',
        zhuyin: [{ char: '淺', onset: 'ㄑ', rime: 'ㄧㄢ', tone: 'ˇ' }, { char: '藍', onset: 'ㄌ', rime: 'ㄢ', tone: 'ˊ' }],
        hex: '#ADD8E6',
        audio: '/audio/colors/light_blue.mp3',
        tags: ['cool', 'light'],
        hueOrder: 5,
        brightness: 80,
        temperature: 20
    },
    {
        id: 'dark_blue',
        nameEn: 'Dark Blue',
        nameZh: '深',
        zhuyin: [{ char: '深', onset: 'ㄕ', rime: 'ㄣ' }, { char: '藍', onset: 'ㄌ', rime: 'ㄢ', tone: 'ˊ' }],
        hex: '#00008B',
        audio: '/audio/colors/dark_blue.mp3',
        tags: ['cool', 'dark'],
        hueOrder: 6.5,
        brightness: 20,
        temperature: 10
    },
    {
        id: 'beige',
        nameEn: 'Beige',
        nameZh: '米',
        zhuyin: [{ char: '米', onset: 'ㄇ', rime: 'ㄧ', tone: 'ˇ' }, { char: '色', onset: 'ㄙ', rime: 'ㄜ', tone: 'ˋ' }],
        hex: '#F5F5DC',
        audio: '/audio/colors/beige.mp3',
        tags: ['warm', 'light'],
        hueOrder: 10,
        brightness: 85,
        temperature: 60
    },
    {
        id: 'cyan',
        nameEn: 'Cyan',
        nameZh: '青',
        zhuyin: [{ char: '青', onset: 'ㄑ', rime: 'ㄧㄥ' }, { char: '色', onset: 'ㄙ', rime: 'ㄜ', tone: 'ˋ' }],
        hex: '#00FFFF',
        audio: '/audio/colors/cyan.mp3',
        tags: ['cool', 'light'],
        hueOrder: 4.5,
        brightness: 80,
        temperature: 30
    }
];
