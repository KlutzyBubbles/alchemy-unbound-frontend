export interface TxnItem {
    id: number,
    description: string,
    amount: number,
    redeem: number,
    category: string,
    singleUse: boolean
}

export const TxnItems: { [key: string]: TxnItem } = {
    fillHints: {
        id: 1,
        description: 'Fill hints to the max you can hold',
        amount: 99,
        redeem: 0,
        category: 'hint',
        singleUse: false
    },
    aiHints: {
        id: 2,
        description: 'Hints now generate for AI items',
        amount: 199,
        redeem: 0,
        category: 'hint',
        singleUse: true
    },
    credit250: {
        id: 3,
        description: 'Add 250 AI credits',
        amount: 99,
        redeem: 250,
        category: 'credits',
        singleUse: false
    },
    credit750: {
        id: 4,
        description: 'Add 750 AI credits',
        amount: 199,
        redeem: 750,
        category: 'credits',
        singleUse: false
    },
    credit1500: {
        id: 5,
        description: 'Add 1500 AI credits',
        amount: 349,
        redeem: 1500,
        category: 'credits',
        singleUse: false
    },
    credit3500: {
        id: 6,
        description: 'Add 3500 AI credits',
        amount: 749,
        redeem: 3500,
        category: 'credits',
        singleUse: false
    },
    themeSand: {
        id: 7,
        description: 'Beach Theme',
        amount: 299,
        redeem: 0,
        category: 'theme',
        singleUse: true
    },
    themePurple: {
        id: 8,
        description: 'Purple Theme',
        amount: 299,
        redeem: 0,
        category: 'theme',
        singleUse: true
    },
    themeOrange: {
        id: 9,
        description: 'Orange Theme',
        amount: 299,
        redeem: 0,
        category: 'theme',
        singleUse: true
    },
    themePink: {
        id: 10,
        description: 'Blossom Theme',
        amount: 299,
        redeem: 0,
        category: 'theme',
        singleUse: true
    },
    themeBlue: {
        id: 11,
        description: 'Sky Theme',
        amount: 299,
        redeem: 0,
        category: 'theme',
        singleUse: true
    }
};
