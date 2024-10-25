import { LanguageStoreRecurring } from '../../store';
import { LanguageStore as ButtonsLanguageStore } from './buttons';
import { LanguageStore as BackgroundsLanguageStore } from './backgrounds';
import { LanguageStore as ItemsLanguageStore } from './items';
import { LanguageStore as ThemesLanguageStore } from './themes';

export const LanguageStore: LanguageStoreRecurring = {
    buttons: ButtonsLanguageStore,
    backgrounds: BackgroundsLanguageStore,
    items: ItemsLanguageStore,
    themes: ThemesLanguageStore,
    title: {
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
    },
    keybinds: {
        english: 'Keybinds',
        schinese: '按键绑定',
        russian: 'Привязки клавиш',
        spanish: 'Atajos',
        french: 'Raccourcis',
        japanese: 'キーバインド',
        indonesian: 'Pengikatan Tombol',
        german: 'Tastenbelegungen',
        latam: 'Atajos',
        italian: 'Assegnazione tasti',
        dutch: 'Toetsenbordcombinaties',
        polish: 'Przypisanie klawiszy',
        portuguese: 'Teclas de atalho',
        tchinese: '按键绑定',
        koreana: '키 바인딩'
    },
    importExport: {
        english: 'Import / Export',
        schinese: '进口/出口',
        russian: 'Импорт / Экспорт',
        spanish: 'Importación / Exportación',
        french: 'Importation / Exportation',
        japanese: '輸入/輸出',
        indonesian: 'Impor / Ekspor',
        german: 'Import / Export',
        latam: 'Importación / Exportación',
        italian: 'Importazione / Esportazione',
        dutch: 'Import / Export',
        polish: 'Import / Eksport',
        portuguese: 'Importação / Exportação',
        tchinese: '進口/出口',
        koreana: '수입 / 수출'
    },
};
