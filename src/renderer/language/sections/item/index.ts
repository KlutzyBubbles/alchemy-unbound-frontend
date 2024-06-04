import { LanguageStoreRecurring } from '../../store';
import { LanguageStore as ButtonsLanguageStore } from './buttons';

export const LanguageStore: LanguageStoreRecurring = {
    buttons: ButtonsLanguageStore,
    title: {
        english: 'Create Item',
        schinese: '创建项目',
        russian: 'Создать элемент',
        spanish: 'Crear elemento',
        french: 'Créer un élément',
        japanese: 'アイテムを作成',
        indonesian: 'Buat Item',
        german: 'Element erstellen',
        latam: 'Crear elemento',
        italian: 'Crea elemento',
        dutch: 'Item maken',
        polish: 'Utwórz przedmiot',
        portuguese: 'Criar item',
        tchinese: '創建專案',
        koreana: '항목 만들기'
    },
    text: {
        english: 'Custom items are best submitted in english, however other languages are supported',
        schinese: '自定义项目最好以英语提交，但支持其他语言',
        russian: 'Пользовательские элементы лучше всего отправлять на английском языке, однако поддерживаются и другие языки',
        spanish: 'Los artículos personalizados se envían mejor en inglés, sin embargo, se admiten otros idiomas',
        french: 'Il est préférable de soumettre les éléments personnalisés en anglais, mais d’autres langues sont prises en charge',
        japanese: 'カスタムアイテムは英語で提出するのが最適ですが、他の言語もサポートされています',
        indonesian: 'Item kustom paling baik dikirim dalam bahasa Inggris, namun bahasa lain didukung',
        german: 'Benutzerdefinierte Elemente werden am besten in Englisch eingereicht, andere Sprachen werden jedoch unterstützt',
        latam: 'Los artículos personalizados se envían mejor en inglés, sin embargo, se admiten otros idiomas',
        italian: 'Gli articoli personalizzati sono meglio inviati in inglese, tuttavia sono supportate altre lingue',
        dutch: 'Aangepaste items kunnen het beste in het Engels worden ingediend, maar andere talen worden ondersteund',
        polish: 'Elementy niestandardowe najlepiej przesyłać w języku angielskim, jednak obsługiwane są inne języki',
        portuguese: 'Os itens personalizados são melhor enviados em inglês, no entanto, outros idiomas são suportados',
        tchinese: '自定義專案最好以英語提交，但支援其他語言',
        koreana: '사용자 지정 항목은 영어로 제출하는 것이 가장 좋지만 다른 언어도 지원됩니다'
    },
    item: {
        english: 'Item',
        schinese: '项目',
        russian: 'Пункт',
        spanish: 'Artículo',
        french: 'Article',
        japanese: 'アイテム',
        indonesian: 'Benda',
        german: 'Artikel',
        latam: 'Artículo',
        italian: 'Articolo',
        dutch: 'Item',
        polish: 'Przedmiot',
        portuguese: 'Item',
        tchinese: '專案',
        koreana: '항목'
    },
    submitted: {
        english: 'Your item has been successfully submitted and added to your game.',
        schinese: '您的物品已成功提交并添加到您的游戏中。',
        russian: 'Ваш предмет успешно отправлен и добавлен в игру.',
        spanish: 'Tu artículo se ha enviado correctamente y se ha añadido al juego.',
        french: 'Votre objet a été soumis et ajouté à votre jeu.',
        japanese: 'アイテムが正常に送信され、ゲームに追加されました。',
        indonesian: 'Item Anda telah berhasil dikirim dan ditambahkan ke game Anda.',
        german: 'Ihr Gegenstand wurde erfolgreich eingereicht und Ihrem Spiel hinzugefügt.',
        latam: 'Tu artículo se ha enviado correctamente y se ha añadido al juego.',
        italian: 'L\'oggetto è stato inviato e aggiunto al gioco.',
        dutch: 'Je item is verzonden en toegevoegd aan je game.',
        polish: 'Twój przedmiot został pomyślnie przesłany i dodany do gry.',
        portuguese: 'Seu item foi enviado e adicionado com sucesso ao seu jogo.',
        tchinese: '您的物品已成功提交並添加到您的遊戲中。',
        koreana: '아이템이 성공적으로 제출되어 게임에 추가되었습니다.'
    },
    inputInvalid: {
        english: 'Invalid inputs, all fields are required and 1-256 characters long.',
        schinese: '无效输入，所有字段都是必需的，且长度为1-256个字符。',
        russian: 'Неверный ввод, все поля обязательны и должны содержать от 1 до 256 символов.',
        spanish: 'Entradas inválidas, todos los campos son requeridos y deben tener entre 1 y 256 caracteres.',
        french: 'Entrées invalides, tous les champs sont requis et doivent comporter entre 1 et 256 caractères.',
        japanese: '無効な入力、すべてのフィールドは必須であり、1〜256文字である必要があります。',
        indonesian: 'Input tidak valid, semua kolom diperlukan dan harus memiliki panjang 1-256 karakter.',
        german: 'Ungültige Eingaben, alle Felder sind erforderlich und müssen 1-256 Zeichen lang sein.',
        latam: 'Entradas inválidas, todos los campos son requeridos y deben tener entre 1 y 256 caracteres.',
        italian: 'Input non validi, tutti i campi sono obbligatori e devono essere lunghi da 1 a 256 caratteri.',
        dutch: 'Ongeldige invoer, alle velden zijn verplicht en moeten 1-256 tekens lang zijn.',
        polish: 'Nieprawidłowe dane wejściowe, wszystkie pola są wymagane i muszą mieć od 1 do 256 znaków.',
        portuguese: 'Entradas inválidas, todos os campos são obrigatórios e devem ter entre 1 e 256 caracteres.',
        tchinese: '無效輸入，所有欄位都是必填的，且長度必須為1-256個字符。',
        koreana: '잘못된 입력, 모든 필드는 필수이며 1-256자여야 합니다.'
    }
};
