import { Languages } from '../../common/types';

export const LanguageStore: {
    [key: string]: Languages
} = {
    name: {
        english: 'name',
        schinese: '姓名',
        russian: 'имя',
        spanish: 'nombre',
        french: 'nom',
        japanese: '名前',
        indonesian: 'nama',
        german: 'Name',
        latam: 'nome',
        italian: 'nome',
        dutch: 'naam',
        polish: 'imię',
        portuguese: 'nome',
        tchinese: '名字',
        koreana: '이름'
    },
    emoji: {
        english: 'emoji',
        schinese: '表情符号',
        russian: 'эмодзи',
        spanish: 'emoji',
        french: 'emoji',
        japanese: '絵文字',
        indonesian: 'emoji',
        german: 'Emoji',
        latam: 'emoji',
        italian: 'emoji',
        dutch: 'emoji',
        polish: 'emoji',
        portuguese: 'emoji',
        tchinese: '表情符號',
        koreana: '이모티콘'
    },
    depth: {
        english: 'depth',
        schinese: '深度',
        russian: 'глубина',
        spanish: 'profundidad',
        french: 'profondeur',
        japanese: '深さ',
        indonesian: 'kedalaman',
        german: 'Tiefe',
        latam: 'profundidade',
        italian: 'profondità',
        dutch: 'diepte',
        polish: 'głębokość',
        portuguese: 'profundidade',
        tchinese: '深度',
        koreana: '깊이'
    },
    all: {
        english: 'All',
        schinese: '所有',
        russian: 'все',
        spanish: 'todos',
        french: 'tous',
        japanese: 'すべて',
        indonesian: 'semua',
        german: 'alle',
        latam: 'todos',
        italian: 'tutti',
        dutch: 'allemaal',
        polish: 'wszystkie',
        portuguese: 'todos',
        tchinese: '全部',
        koreana: '모든'
    },
    base: {
        english: 'Base',
        schinese: '基地',
        russian: 'основа',
        spanish: 'base',
        french: 'base',
        japanese: 'ベース',
        indonesian: 'dasar',
        german: 'Basis',
        latam: 'base',
        italian: 'base',
        dutch: 'basis',
        polish: 'podstawa',
        portuguese: 'base',
        tchinese: '基地',
        koreana: '기초'
    },
    firstDiscovered: {
        english: 'First discovered',
        schinese: '首次发现',
        russian: 'первооткрыватель',
        spanish: 'primer descubierto',
        french: 'première découverte',
        japanese: '最初に発見された',
        indonesian: 'pertama ditemukan',
        german: 'zuerst entdeckt',
        latam: 'primeira descoberta',
        italian: 'prima scoperta',
        dutch: 'eerst ontdekt',
        polish: 'pierwsze odkrycie',
        portuguese: 'primeira descoberta',
        tchinese: '首次發現',
        koreana: '처음 발견된'
    },
    search: {
        english: 'Search {0} elements',
        schinese: '搜索 {0} 个元素',
        russian: 'Поиск {0} элементов',
        spanish: 'Buscar {0} elementos',
        french: 'Rechercher {0} éléments',
        japanese: '{0} 個の要素を検索',
        indonesian: 'Cari {0} elemen',
        german: 'Suche {0} Elemente',
        latam: 'Pesquisar {0} elementos',
        italian: 'Cerca {0} elementi',
        dutch: 'Zoek {0} elementen',
        polish: 'Szukaj {0} elementów',
        portuguese: 'Pesquisar {0} elementos',
        tchinese: '搜索 {0} 元素',
        koreana: '{0} 개 요소 검색'
    },
    settings: {
        english: 'Settings',
        schinese: '设置',
        russian: 'настройки',
        spanish: 'ajustes',
        french: 'paramètres',
        japanese: '設定',
        indonesian: 'pengaturan',
        german: 'Einstellungen',
        latam: 'configurações',
        italian: 'impostazioni',
        dutch: 'instellingen',
        polish: 'ustawienia',
        portuguese: 'configurações',
        tchinese: '設置',
        koreana: '설정'
    },
    fullscreen: {
        english: 'Fullscreen',
        schinese: '全屏',
        russian: 'полноэкранный',
        spanish: 'Pantalla completa',
        french: 'Plein écran',
        japanese: 'フルスクリーン',
        indonesian: 'Layar Penuh',
        german: 'Vollbild',
        latam: 'Tela cheia',
        italian: 'Schermo intero',
        dutch: 'Volledig scherm',
        polish: 'Pełny ekran',
        portuguese: 'Tela cheia',
        tchinese: '全屏',
        koreana: '전체 화면'
    },
    display: {
        english: 'Display',
        schinese: '显示',
        russian: 'дисплей',
        spanish: 'visualización',
        french: 'affichage',
        japanese: 'ディスプレイ',
        indonesian: 'tampilan',
        german: 'Anzeige',
        latam: 'exibição',
        italian: 'display',
        dutch: 'weergave',
        polish: 'wyświetlacz',
        portuguese: 'exibição',
        tchinese: '显示',
        koreana: '디스플레이'
    },
    saveChanges: {
        english: 'Save Changes',
        schinese: '保存更改',
        russian: 'Сохранить изменения',
        spanish: 'Guardar cambios',
        french: 'Enregistrer les modifications',
        japanese: '変更を保存',
        indonesian: 'Simpan Perubahan',
        german: 'Änderungen speichern',
        latam: 'Salvar alterações',
        italian: 'Salva modifiche',
        dutch: 'Wijzigingen opslaan',
        polish: 'Zapisz zmiany',
        portuguese: 'Salvar alterações',
        tchinese: '保存更改',
        koreana: '변경 사항 저장'
    },
    filterBy: {
        english: 'Filter by',
        schinese: '按...筛选',
        russian: 'Фильтровать по',
        spanish: 'Filtrar por',
        french: 'Filtrer par',
        japanese: '...でフィルター',
        indonesian: 'Filter berdasarkan',
        german: 'Filtern nach',
        latam: 'Filtrar por',
        italian: 'Filtra per',
        dutch: 'Filteren op',
        polish: 'Filtruj według',
        portuguese: 'Filtrar por',
        tchinese: '按...筛选',
        koreana: '...별로 필터링'
    },
    sortBy: {
        english: 'Sort by',
        schinese: '按...排序',
        russian: 'Сортировать по',
        spanish: 'Ordenar por',
        french: 'Trier par',
        japanese: '...でソート',
        indonesian: 'Urutkan berdasarkan',
        german: 'Sortieren nach',
        latam: 'Ordenar por',
        italian: 'Ordina per',
        dutch: 'Sorteren op',
        polish: 'Sortuj według',
        portuguese: 'Ordenar por',
        tchinese: '按...排序',
        koreana: '...별로 정렬'
    },
    discovered: {
        english: 'discovered',
        schinese: '已发现',
        russian: 'обнаружено',
        spanish: 'descubierto',
        french: 'découvert',
        japanese: '発見された',
        indonesian: 'ditemukan',
        german: 'entdeckt',
        latam: 'descoberto',
        italian: 'scoperto',
        dutch: 'ontdekt',
        polish: 'odkryto',
        portuguese: 'descoberto',
        tchinese: '已發現',
        koreana: '발견됨'
    },
    blankBackground: {
        english: 'Empty',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    lineBackground: {
        english: 'Line',
        schinese: '线',
        russian: 'линия',
        spanish: 'Línea',
        french: 'Ligne',
        japanese: 'ライン',
        indonesian: 'Garis',
        german: 'Linie',
        latam: 'Linha',
        italian: 'Linea',
        dutch: 'Lijn',
        polish: 'Linia',
        portuguese: 'Linha',
        tchinese: '線',
        koreana: '라인'
    },
    selectScreen: {
        english: 'Please select a screen',
        schinese: '请选择一个屏幕',
        russian: 'Выберите экран',
        spanish: 'Por favor, seleccione una pantalla',
        french: 'Veuillez sélectionner un écran',
        japanese: '画面を選択してください',
        indonesian: 'Silakan pilih layar',
        german: 'Bitte wählen Sie einen Bildschirm aus',
        latam: 'Por favor, selecione uma tela',
        italian: 'Si prega di selezionare uno schermo',
        dutch: 'Selecteer alstublieft een scherm',
        polish: 'Proszę wybrać ekran',
        portuguese: 'Por favor, selecione uma tela',
        tchinese: '請選擇一個屏幕',
        koreana: '화면을 선택하세요'
    },
    darkMode: {
        english: 'Dark Mode',
        schinese: '暗模式',
        russian: 'Темный режим',
        spanish: 'Modo oscuro',
        french: 'Mode sombre',
        japanese: 'ダークモード',
        indonesian: 'Mode Gelap',
        german: 'Dunkelmodus',
        latam: 'Modo escuro',
        italian: 'Modalità scura',
        dutch: 'Donkere modus',
        polish: 'Tryb ciemny',
        portuguese: 'Modo escuro',
        tchinese: '暗模式',
        koreana: '다크 모드'
    },
    background: {
        english: 'Background',
        schinese: '背景',
        russian: 'фон',
        spanish: 'Fondo',
        french: 'Arrière-plan',
        japanese: '背景',
        indonesian: 'Latar Belakang',
        german: 'Hintergrund',
        latam: 'Fundo',
        italian: 'Sfondo',
        dutch: 'Achtergrond',
        polish: 'Tło',
        portuguese: 'Fundo',
        tchinese: '背景',
        koreana: '배경'
    },
    language: {
        english: 'Language',
        schinese: '语言',
        russian: 'язык',
        spanish: 'Idioma',
        french: 'Langue',
        japanese: '言語',
        indonesian: 'Bahasa',
        german: 'Sprache',
        latam: 'Língua',
        italian: 'Lingua',
        dutch: 'Taal',
        polish: 'Język',
        portuguese: 'Língua',
        tchinese: '語言',
        koreana: '언어'
    },
    quit: {
        english: 'Quit',
        schinese: '退出',
        russian: 'Выйти',
        spanish: 'Salir',
        french: 'Quitter',
        japanese: '終了',
        indonesian: 'Keluar',
        german: 'Beenden',
        latam: 'Sair',
        italian: 'Esci',
        dutch: 'Afsluiten',
        polish: 'Zamknij',
        portuguese: 'Sair',
        tchinese: '退出',
        koreana: '종료'
    },
    offline: {
        english: 'Offline Mode',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    volume: {
        english: 'Volume',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    advanced: {
        english: 'Advanced',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    fps: {
        english: 'Background FPS',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    resetButton: {
        english: 'Reset',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    importButton: {
        english: 'Import Save',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    exportButton: {
        english: 'Export Save',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    cancel: {
        english: 'Cancel',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    confirm: {
        english: 'Confirm',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    recipesFound: {
        english: 'Recipes Found',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    resultsFound: {
        english: 'Results Found',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    highestDepth: {
        english: 'Highest Depth',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    firstDiscoveries: {
        english: 'First Discoveries',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    itemsCombined: {
        english: 'Items Combined',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    ai: {
        english: 'AI',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    total: {
        english: 'Total',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    stats: {
        english: 'Statistics',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    developedBy: {
        english: 'Developed by',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    steamAssetsBy: {
        english: 'Steam assets by',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    resetTitle: {
        english: 'Are you sure you want to reset your save data?',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    resetText: {
        english: 'A backup will be created however this will NOT be saved to Steam Cloud',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    imported: {
        english: 'Imported',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    exported: {
        english: 'Exported',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    },
    userCancelled: {
        english: 'User cnacelled the opperation',
        schinese: '',
        russian: '',
        spanish: '',
        french: '',
        japanese: '',
        indonesian: '',
        german: '',
        latam: '',
        italian: '',
        dutch: '',
        polish: '',
        portuguese: '',
        tchinese: '',
        koreana: ''
    }
};


/*

<td>Recipes Found</td>
<td>Results Found</td>
<td>Highest Depth</td>
<td>First Discoveries</td>
<td>Items Combined</td>


*/
