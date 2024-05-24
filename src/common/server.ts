export interface TxnItem {
    id: number,
    description: string,
    amount: number,
    category: string,
    singleUse: boolean
}

export const TxnItems: { [key: string]: TxnItem } = {
    fillHints: {
        id: 1,
        description: 'Fill hints to the max you can hold',
        amount: 99,
        category: 'hint',
        singleUse: false
    },
    aiHints: {
        id: 2,
        description: 'Hints now generate for AI items',
        amount: 199,
        category: 'hint',
        singleUse: true
    },
    credit500: {
        id: 3,
        description: 'Add 500 custom credits',
        amount: 99,
        category: 'credits',
        singleUse: false
    },
    credit1500: {
        id: 4,
        description: 'Add 1500 custom credits',
        amount: 199,
        category: 'credits',
        singleUse: false
    },
    credit2500: {
        id: 5,
        description: 'Add 2500 custom credits',
        amount: 299,
        category: 'credits',
        singleUse: false
    },
    credit5000: {
        id: 6,
        description: 'Add 5000 custom credits',
        amount: 499,
        category: 'credits',
        singleUse: false
    },
    themeSand: {
        id: 7,
        description: 'Sand Theme',
        amount: 199,
        category: 'theme',
        singleUse: true
    },
    themePurple: {
        id: 8,
        description: 'Purple Theme',
        amount: 199,
        category: 'theme',
        singleUse: true
    },
    themeOrange: {
        id: 9,
        description: 'Orange Theme',
        amount: 199,
        category: 'theme',
        singleUse: true
    }
};
