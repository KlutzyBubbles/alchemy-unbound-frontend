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
        schinese: '空',
        russian: 'Пустой',
        spanish: 'Vacío',
        french: 'Vide',
        japanese: '空',
        indonesian: 'Kosong',
        german: 'Leer',
        latam: 'Vacío',
        italian: 'Vuoto',
        dutch: 'Leeg',
        polish: 'Pusty',
        portuguese: 'Vazio',
        tchinese: '空',
        koreana: '빈'
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
        schinese: '离线模式',
        russian: 'Оффлайн режим',
        spanish: 'Modo offline',
        french: 'Mode hors ligne',
        japanese: 'オフラインモード',
        indonesian: 'Mode Offline',
        german: 'Offline-Modus',
        latam: 'Modo sin conexión',
        italian: 'Modalità offline',
        dutch: 'Offline modus',
        polish: 'Tryb offline',
        portuguese: 'Modo offline',
        tchinese: '離線模式',
        koreana: '오프라인 모드'
    },
    volume: {
        english: 'Volume',
        schinese: '音量',
        russian: 'Громкость',
        spanish: 'Volumen',
        french: 'Volume',
        japanese: '音量',
        indonesian: 'Volume',
        german: 'Lautstärke',
        latam: 'Volumen',
        italian: 'Volume',
        dutch: 'Volume',
        polish: 'Głośność',
        portuguese: 'Volume',
        tchinese: '音量',
        koreana: '볼륨'
    },
    advanced: {
        english: 'Advanced',
        schinese: '高级',
        russian: 'Продвинутый',
        spanish: 'Avanzado',
        french: 'Avancé',
        japanese: '高度な',
        indonesian: 'Tingkat Lanjut',
        german: 'Fortgeschritten',
        latam: 'Avanzado',
        italian: 'Avanzato',
        dutch: 'Geavanceerd',
        polish: 'Zaawansowany',
        portuguese: 'Avançado',
        tchinese: '進階',
        koreana: '고급'
    },
    fps: {
        english: 'Background FPS',
        schinese: '后台FPS',
        russian: 'FPS фонового режима',
        spanish: 'FPS en segundo plano',
        french: 'FPS en arrière-plan',
        japanese: 'バックグラウンドFPS',
        indonesian: 'FPS Latar Belakang',
        german: 'Hintergrund-FPS',
        latam: 'FPS em segundo plano',
        italian: 'FPS in background',
        dutch: 'Achtergrond FPS',
        polish: 'FPS w tle',
        portuguese: 'FPS em segundo plano',
        tchinese: '背景FPS',
        koreana: '백그라운드 FPS'
    },
    resetButton: {
        english: 'Reset',
        schinese: '重置',
        russian: 'Сброс',
        spanish: 'Reiniciar',
        french: 'Réinitialiser',
        japanese: 'リセット',
        indonesian: 'Reset',
        german: 'Zurücksetzen',
        latam: 'Reiniciar',
        italian: 'Ripristina',
        dutch: 'Reset',
        polish: 'Reset',
        portuguese: 'Redefinir',
        tchinese: '重置',
        koreana: '재설정'
    },
    importButton: {
        english: 'Import Save',
        schinese: '导入存档',
        russian: 'Импортировать сохранение',
        spanish: 'Importar guardado',
        french: 'Importer la sauvegarde',
        japanese: 'セーブデータをインポート',
        indonesian: 'Impor Simpan',
        german: 'Speicherstand importieren',
        latam: 'Importar guardado',
        italian: 'Importa salvataggio',
        dutch: 'Opslaan importeren',
        polish: 'Importuj zapis',
        portuguese: 'Importar salvar',
        tchinese: '導入存檔',
        koreana: '저장물 가져 오기'
    },
    exportButton: {
        english: 'Export Save',
        schinese: '导出存档',
        russian: 'Экспорт сохранения',
        spanish: 'Exportar guardado',
        french: 'Exporter la sauvegarde',
        japanese: 'セーブデータをエクスポート',
        indonesian: 'Ekspor Simpan',
        german: 'Speicherstand exportieren',
        latam: 'Exportar guardado',
        italian: 'Esporta salvataggio',
        dutch: 'Opslaan exporteren',
        polish: 'Eksportuj zapis',
        portuguese: 'Exportar salvar',
        tchinese: '導出存檔',
        koreana: '내보내기 저장'
    },
    cancel: {
        english: 'Cancel',
        schinese: '取消',
        russian: 'Отмена',
        spanish: 'Cancelar',
        french: 'Annuler',
        japanese: 'キャンセル',
        indonesian: 'Batal',
        german: 'Abbrechen',
        latam: 'Cancelar',
        italian: 'Annulla',
        dutch: 'Annuleren',
        polish: 'Anuluj',
        portuguese: 'Cancelar',
        tchinese: '取消',
        koreana: '취소'
    },
    confirm: {
        english: 'Confirm',
        schinese: '确认',
        russian: 'Подтвердить',
        spanish: 'Confirmar',
        french: 'Confirmer',
        japanese: '確認',
        indonesian: 'Konfirmasi',
        german: 'Bestätigen',
        latam: 'Confirmar',
        italian: 'Conferma',
        dutch: 'Bevestigen',
        polish: 'Potwierdź',
        portuguese: 'Confirmar',
        tchinese: '確認',
        koreana: '확인'
    },
    recipesFound: {
        english: 'Recipes Found',
        schinese: '找到食谱',
        russian: 'Найденные рецепты',
        spanish: 'Recetas Encontradas',
        french: 'Recettes Trouvées',
        japanese: 'レシピが見つかりました',
        indonesian: 'Resep Ditemukan',
        german: 'Gefundene Rezepte',
        latam: 'Recetas Encontradas',
        italian: 'Ricette Trovate',
        dutch: 'Recepten Gevonden',
        polish: 'Znalezione przepisy',
        portuguese: 'Receitas Encontradas',
        tchinese: '找到食譜',
        koreana: '레시피 발견'
    },
    resultsFound: {
        english: 'Results Found',
        schinese: '找到结果',
        russian: 'Найдены результаты',
        spanish: 'Resultados Encontrados',
        french: 'Résultats Trouvés',
        japanese: '結果が見つかりました',
        indonesian: 'Hasil Ditemukan',
        german: 'Ergebnisse gefunden',
        latam: 'Resultados Encontrados',
        italian: 'Risultati Trovati',
        dutch: 'Resultaten Gevonden',
        polish: 'Znaleziono wyniki',
        portuguese: 'Resultados Encontrados',
        tchinese: '找到結果',
        koreana: '결과를 찾았습니다'
    },
    highestDepth: {
        english: 'Highest Depth',
        schinese: '最大深度',
        russian: 'Максимальная глубина',
        spanish: 'Máxima Profundidad',
        french: 'Profondeur Maximale',
        japanese: '最大深度',
        indonesian: 'Kedalaman Tertinggi',
        german: 'Höchste Tiefe',
        latam: 'Máxima Profundidad',
        italian: 'Massima Profondità',
        dutch: 'Hoogste Diepte',
        polish: 'Największa Głębokość',
        portuguese: 'Maior Profundidade',
        tchinese: '最大深度',
        koreana: '최대 깊이'
    },
    firstDiscoveries: {
        english: 'First Discoveries',
        schinese: '首次发现',
        russian: 'Первые открытия',
        spanish: 'Primeros Descubrimientos',
        french: 'Premières Découvertes',
        japanese: '最初の発見',
        indonesian: 'Penemuan Pertama',
        german: 'Erste Entdeckungen',
        latam: 'Primeros Descubrimientos',
        italian: 'Primi Scoperti',
        dutch: 'Eerste Ontdekkingen',
        polish: 'Pierwsze Odkrycia',
        portuguese: 'Primeiras Descobertas',
        tchinese: '首次發現',
        koreana: '최초의 발견'
    },
    itemsCombined: {
        english: 'Items Combined',
        schinese: '合并物品',
        russian: 'Комбинированные предметы',
        spanish: 'Objetos Combinados',
        french: 'Objets combinés',
        japanese: 'アイテムが結合されました',
        indonesian: 'Item Digabungkan',
        german: 'Gegenstände kombiniert',
        latam: 'Objetos Combinados',
        italian: 'Oggetti Combinati',
        dutch: 'Items Gecombineerd',
        polish: 'Połączone przedmioty',
        portuguese: 'Itens Combinados',
        tchinese: '合併物品',
        koreana: '아이템 결합됨'
    },
    ai: {
        english: 'AI',
        schinese: '人工智能',
        russian: 'ИИ',
        spanish: 'IA',
        french: 'IA',
        japanese: 'AI',
        indonesian: 'AI',
        german: 'KI',
        latam: 'IA',
        italian: 'IA',
        dutch: 'AI',
        polish: 'SI',
        portuguese: 'IA',
        tchinese: '人工智能',
        koreana: 'AI'
    },
    total: {
        english: 'Total',
        schinese: '总',
        russian: 'Всего',
        spanish: 'Total',
        french: 'Total',
        japanese: '合計',
        indonesian: 'Total',
        german: 'Gesamt',
        latam: 'Total',
        italian: 'Totale',
        dutch: 'Totaal',
        polish: 'Razem',
        portuguese: 'Total',
        tchinese: '總',
        koreana: '합계'
    },
    stats: {
        english: 'Statistics',
        schinese: '统计',
        russian: 'Статистика',
        spanish: 'Estadísticas',
        french: 'Statistiques',
        japanese: '統計',
        indonesian: 'Statistik',
        german: 'Statistiken',
        latam: 'Estadísticas',
        italian: 'Statistiche',
        dutch: 'Statistieken',
        polish: 'Statystyki',
        portuguese: 'Estatísticas',
        tchinese: '統計',
        koreana: '통계'
    },
    developedBy: {
        english: 'Developed by',
        schinese: '开发者',
        russian: 'Разработано',
        spanish: 'Desarrollado por',
        french: 'Développé par',
        japanese: '開発者',
        indonesian: 'Dikembangkan oleh',
        german: 'Entwickelt von',
        latam: 'Desarrollado por',
        italian: 'Sviluppato da',
        dutch: 'Ontwikkeld door',
        polish: 'Opracowane przez',
        portuguese: 'Desenvolvido por',
        tchinese: '開發者',
        koreana: '개발자'
    },
    steamAssetsBy: {
        english: 'Steam assets by',
        schinese: 'Steam资产由',
        russian: 'Ресурсы Steam от',
        spanish: 'Activos de Steam por',
        french: 'Ressources Steam par',
        japanese: 'Steamアセット提供',
        indonesian: 'Aset Steam oleh',
        german: 'Steam-Assets von',
        latam: 'Activos de Steam por',
        italian: 'Risorse di Steam di',
        dutch: 'Steam-assets door',
        polish: 'Zasoby Steam przez',
        portuguese: 'Ativos do Steam por',
        tchinese: 'Steam資產由',
        koreana: 'Steam 자산 제공'
    },
    resetTitle: {
        english: 'Are you sure you want to reset your save data?',
        schinese: '您确定要重置保存数据吗？',
        russian: 'Вы уверены, что хотите сбросить данные сохранения?',
        spanish: '¿Estás seguro de que quieres restablecer tus datos guardados?',
        french: 'Êtes-vous sûr de vouloir réinitialiser vos données sauvegardées ?',
        japanese: 'セーブデータをリセットしますか？',
        indonesian: 'Apakah Anda yakin ingin mereset data simpanan Anda?',
        german: 'Sind Sie sicher, dass Sie Ihre Speicherdaten zurücksetzen möchten?',
        latam: '¿Estás seguro de que quieres restablecer tus datos guardados?',
        italian: 'Sei sicuro di voler resettare i tuoi dati salvati?',
        dutch: 'Weet u zeker dat u uw opgeslagen gegevens wilt resetten?',
        polish: 'Czy na pewno chcesz zresetować dane zapisane?',
        portuguese: 'Tem certeza de que deseja redefinir seus dados salvos?',
        tchinese: '您確定要重置保存數據嗎？',
        koreana: '저장 데이터를 재설정 하시겠습니까?'
    },
    resetText: {
        english: 'A backup will be created however this will NOT be saved to Steam Cloud',
        schinese: '备份将被创建，但不会保存到Steam云端',
        russian: 'Будет создана резервная копия, однако она НЕ будет сохранена в облаке Steam',
        spanish: 'Se creará una copia de seguridad, sin embargo, esta NO se guardará en la nube de Steam',
        french: 'Une sauvegarde sera créée, cependant elle NE sera PAS sauvegardée sur le Cloud Steam',
        japanese: 'バックアップが作成されますが、これはSteam Cloudに保存されません',
        indonesian: 'Cadangan akan dibuat namun ini TIDAK akan disimpan ke Steam Cloud',
        german: 'Es wird ein Backup erstellt, jedoch wird dies NICHT in der Steam Cloud gespeichert',
        latam: 'Se creará una copia de seguridad, sin embargo, esta NO se guardará en la nube de Steam',
        italian: 'Verrà creata un backup, tuttavia questo NON sarà salvato su Steam Cloud',
        dutch: 'Er wordt een back-up gemaakt, maar deze wordt NIET opgeslagen in de Steam-cloud',
        polish: 'Zostanie utworzona kopia zapasowa, jednak nie będzie ona zapisana w chmurze Steam',
        portuguese: 'Será criado um backup, no entanto, este NÃO será salvo na nuvem da Steam',
        tchinese: '將建立備份，但不會保存到Steam雲端',
        koreana: '백업이 생성될 것이지만 이것은 스팀 클라우드에 저장되지 않습니다'
    },
    imported: {
        english: 'Imported',
        schinese: '已导入',
        russian: 'Импортировано',
        spanish: 'Importado',
        french: 'Importé',
        japanese: 'インポート済み',
        indonesian: 'Diimpor',
        german: 'Importiert',
        latam: 'Importado',
        italian: 'Importato',
        dutch: 'Geïmporteerd',
        polish: 'Zaimportowane',
        portuguese: 'Importado',
        tchinese: '已導入',
        koreana: '가져옴'
    },
    exported: {
        english: 'Exported',
        schinese: '导出',
        russian: 'Экспортировано',
        spanish: 'Exportado',
        french: 'Exporté',
        japanese: 'エクスポート済み',
        indonesian: 'Diekspor',
        german: 'Exportiert',
        latam: 'Exportado',
        italian: 'Esportato',
        dutch: 'Geëxporteerd',
        polish: 'Eksportowane',
        portuguese: 'Exportado',
        tchinese: '已导出',
        koreana: '내보냄'
    },
    userCancelled: {
        english: 'User cancelled the operation',
        schinese: '用户取消了操作',
        russian: 'Пользователь отменил операцию',
        spanish: 'El usuario canceló la operación',
        french: 'L\'utilisateur a annulé l\'opération',
        japanese: 'ユーザーが操作をキャンセルしました',
        indonesian: 'Pengguna membatalkan operasi',
        german: 'Benutzer hat den Vorgang abgebrochen',
        latam: 'El usuario canceló la operación',
        italian: 'L\'utente ha annullato l\'operazione',
        dutch: 'Gebruiker heeft de bewerking geannuleerd',
        polish: 'Użytkownik anulował operację',
        portuguese: 'O usuário cancelou a operação',
        tchinese: '用户取消了操作',
        koreana: '사용자가 작업을 취소했습니다'
    }
};
