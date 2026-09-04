// =========================================================
// Язык (по умолчанию армянский, переключение на русский) и
// тема (светлая/тёмная). Хранится в localStorage браузера.
// Подключать на КАЖДОЙ странице, после supabaseClient.js/common.js.
// =========================================================

const translations = {
  hy: {
    brand: 'Դպրոցական պորտֆոլիո',
    'nav.dashboard': 'Իմ պորտֆոլիոն',
    'nav.calendar': 'Օրացույց',
    'nav.announcements': 'Ծանուցումներ',
    'nav.teacher': 'Ուսուցչի համար',
    'nav.admin': 'Ադմին',
    logout: 'Ելք',
    'role.student': 'աշակերտ',
    'role.teacher': 'ուսուցիչ',
    'role.admin': 'ադմին',

    'login.title': 'Դպրոցական պորտֆոլիո',
    'login.subtitle': 'Մուտք գործեք՝ անձնական էջը բացելու համար։',
    'login.email': 'Էլ. հասցե',
    'login.password': 'Գաղտնաբառ',
    'login.submit': 'Մուտք',
    'login.submitting': 'Մուտք ենք գործում...',
    'login.error': 'Չհաջողվեց մուտք գործել. ստուգեք էլ. հասցեն և գաղտնաբառը։',
    'login.noAccount': 'Դեռ հաշիվ չունե՞ք։',
    'login.register': 'Գրանցվել',
    'login.forgotPassword': 'Մոռացե՞լ եք գաղտնաբառը։',

    'forgot.title': 'Վերականգնել գաղտնաբառը',
    'forgot.subtitle': 'Մուտքագրեք ձեր էլ. հասցեն, կուղարկենք հղում գաղտնաբառը փոխելու համար։',
    'forgot.email': 'Էլ. հասցե',
    'forgot.submit': 'Ուղարկել հղումը',
    'forgot.submitting': 'Ուղարկում ենք...',
    'forgot.success': 'Եթե այս էլ. հասցեով հաշիվ կա, ուղարկվել է նամակ գաղտնաբառը փոխելու հղումով։',
    'forgot.error': 'Չհաջողվեց ուղարկել. փորձեք կրկին։',
    'forgot.backToLogin': 'Վերադառնալ մուտք գործելուն',

    'reset.title': 'Նոր գաղտնաբառ',
    'reset.subtitle': 'Մուտքագրեք ձեր նոր գաղտնաբառը։',
    'reset.newPassword': 'Նոր գաղտնաբառ',
    'reset.confirmPassword': 'Կրկնեք գաղտնաբառը',
    'reset.submit': 'Պահպանել նոր գաղտնաբառը',
    'reset.submitting': 'Պահպանում ենք...',
    'reset.success': 'Գաղտնաբառը փոխված է։ Այժմ կարող եք մուտք գործել։',
    'reset.error': 'Չհաջողվեց փոխել գաղտնաբառը՝ ',
    'reset.mismatch': 'Գաղտնաբառերը չեն համընկնում։',
    'reset.invalidLink': 'Հղումն անվավեր է կամ ժամկետանց է։ Հայցեք նոր հղում։',

    'register.title': 'Գրանցում',
    'register.subtitle': 'Ստեղծեք աշակերտի հաշիվ։',
    'register.firstName': 'Անուն',
    'register.lastName': 'Ազգանուն',
    'register.class': 'Դասարան',
    'register.classPlaceholder': 'օրինակ՝ 10-Բ',
    'register.email': 'Էլ. հասցե',
    'register.password': 'Գաղտնաբառ',
    'register.passwordHint': 'Առնվազն 6 նիշ։',
    'register.submit': 'Գրանցվել',
    'register.submitting': 'Գրանցում ենք...',
    'register.errorPrefix': 'Չհաջողվեց գրանցվել՝ ',
    'register.success': 'Հաշիվը ստեղծված է։ Ստուգեք փոստը և հաստատեք էլ. հասցեն, ապա մուտք գործեք։',
    'register.haveAccount': 'Արդեն ունե՞ք հաշիվ։',
    'register.login': 'Մուտք',

    'dashboard.tabPortfolio': 'Պորտֆոլիո',
    'dashboard.tabEvents': 'Իմ գրանցումները',
    'dashboard.title': 'Իմ պորտֆոլիոն',
    'dashboard.addItem': '+ Ավելացնել աշխատանք',
    'dashboard.publicLink': 'Ձեր պորտֆոլիոյի հրապարակային հղումը՝ ',
    'dashboard.formTitleNew': 'Նոր աշխատանք',
    'dashboard.formTitleEdit': 'Խմբագրել աշխատանքը',
    'dashboard.avatarLabel': 'Ձեր նկարը',
    'dashboard.avatarUpload': 'Փոխել նկարը',
    'dashboard.avatarUploading': 'Վերբեռնում ենք...',
    'dashboard.avatarError': 'Չհաջողվեց վերբեռնել նկարը՝ ',
    'dashboard.qrLabel': 'Ձեր պորտֆոլիոյի QR-կոդը',
    'dashboard.qrHint': 'Ցուցադրեք այս կոդը, որպեսզի ուրիշները արագ բացեն ձեր պորտֆոլիոն։',
    'item.eventLabel': 'Կապել մասնակցած միջոցառման հետ (ոչ պարտադիր)',
    'item.eventNone': '— չկա —',
    'item.linkedEvent': 'Մասնակցել է միջոցառմանը՝ ',
    'item.attachmentsLabel': 'Ֆայլեր և հղումներ',
    'item.addFile': '+ Ֆայլ',
    'item.addLink': '+ Հղում',
    'item.existingAttachments': 'Կցված ֆայլեր/հղումներ',
    'item.attachmentDeleteConfirm': 'Ջնջե՞լ այս կցորդը։',
    'item.titleLabel': 'Վերնագիր',
    'item.categoryLabel': 'Կատեգորիա',
    'category.project': 'Նախագիծ',
    'category.achievement': 'Ձեռքբերում',
    'category.certificate': 'Վկայական',
    'category.creative': 'Ստեղծագործական աշխատանք',
    'item.dateLabel': 'Ամսաթիվ',
    'item.descriptionLabel': 'Նկարագրություն',
    'item.fileLabel': 'Ֆայլ (լուսանկար/փաստաթուղթ, ոչ պարտադիր)',
    'item.existingFileHint': 'Արդեն կցված է ֆայլ։ Ընտրեք նորը՝ փոխարինելու համար։',
    'item.linkLabel': 'Կամ արտաքին հղում (ոչ պարտադիր)',
    save: 'Պահպանել',
    saving: 'Պահպանում ենք...',
    cancel: 'Չեղարկել',
    'item.saveError': 'Պահպանման սխալ՝ ',
    'portfolio.empty': 'Առայժմ դատարկ է։ Ավելացրեք առաջին աշխատանքը պորտֆոլիոյում։',
    'portfolio.loadError': 'Չհաջողվեց բեռնել պորտֆոլիոն։',
    edit: 'Խմբագրել',
    delete: 'Ջնջել',
    'item.deleteConfirm': 'Ջնջե՞լ այս աշխատանքը պորտֆոլիոյից։',
    'item.deleteError': 'Չհաջողվեց ջնջել՝ ',
    openFile: 'Բացել ֆայլը',
    externalLink: 'Արտաքին հղում',
    'events.myTitle': 'Իմ գրանցումները միջոցառումների',
    'events.empty': 'Դուք դեռ գրանցված չեք ոչ մի միջոցառման։',
    'events.viewCalendar': 'Տեսնել օրացույցը',
    'events.cancelReg': 'Չեղարկել գրանցումը',
    'events.cancelConfirm': 'Չեղարկե՞լ գրանցումը այս միջոցառմանը։',
    'events.cancelError': 'Չհաջողվեց չեղարկել գրանցումը՝ ',
    'events.loadError': 'Չհաջողվեց բեռնել գրանցումները։',

    'portfolio.pageTitle': 'Աշակերտի պորտֆոլիո',
    'portfolio.noId': 'Պորտֆոլիոյի հղումը նշված չէ։',
    'portfolio.notFound': 'Պորտֆոլիոն չի գտնվել։',
    'portfolio.classLabel': 'Դասարան՝ ',
    'portfolio.filterAll': 'Բոլորը',
    'comment.label': 'Ուսուցչի մեկնաբանություններ',
    'comment.placeholder': 'Ձեր մեկնաբանությունը...',
    'comment.submit': 'Ավելացնել մեկնաբանություն',
    'comment.deleteConfirm': 'Ջնջե՞լ այս մեկնաբանությունը։',

    'calendar.title': 'Միջոցառումների օրացույց',
    'calendar.subtitle': 'Դպրոցի բոլոր առաջիկա միջոցառումները և ներկայացումները։',
    'calendar.loadError': 'Չհաջողվեց բեռնել միջոցառումները։',
    'calendar.empty': 'Առայժմ պլանավորված միջոցառումներ չկան։',
    'calendar.organizer': 'Կազմակերպիչ՝ ',
    'calendar.registeredSuffix': ' գրանցված',
    'calendar.full': 'Տեղեր չկան',
    'calendar.register': 'Գրանցվել',
    'calendar.registerError': 'Չհաջողվեց գրանցվել՝ ',

    'teacher.tabEvents': 'Իմ միջոցառումները',
    'teacher.tabPortfolios': 'Աշակերտների պորտֆոլիո',
    'teacher.createTitle': 'Ստեղծել միջոցառում',
    'event.titleLabel': 'Վերնագիր',
    'event.descriptionLabel': 'Նկարագրություն',
    'event.datetimeLabel': 'Ամսաթիվ և ժամ',
    'event.locationLabel': 'Վայր',
    'event.maxLabel': 'Առավելագույն մասնակիցներ (ոչ պարտադիր)',
    'event.create': 'Ստեղծել միջոցառում',
    'event.creating': 'Ստեղծում ենք...',
    'event.error': 'Սխալ՝ ',
    'teacher.myEventsTitle': 'Իմ միջոցառումները և գրանցվածները',
    'teacher.myEventsEmpty': 'Դուք դեռ ոչ մի միջոցառում չեք ստեղծել։',
    'teacher.eventsLoadError': 'Չհաջողվեց բեռնել միջոցառումները։',
    'teacher.registeredLabel': 'Գրանցվել են՝ ',
    'teacher.noneRegistered': 'առայժմ ոչ ոք չի գրանցվել',
    'event.deleteConfirm': 'Ջնջե՞լ այս միջոցառումը։ Դրա բոլոր գրանցումները նույնպես կջնջվեն։',
    'event.delete': 'Ջնջել միջոցառումը',
    'teacher.searchPlaceholder': 'Որոնել ըստ անվան, ազգանվան կամ դասարանի...',
    'teacher.studentsEmpty': 'Աշակերտներ չեն գտնվել։',
    'teacher.classLabel': 'Դասարան՝ ',
    'teacher.openPortfolio': 'Բացել պորտֆոլիոն',
    'teacher.studentsLoadError': 'Չհաջողվեց բեռնել աշակերտների ցանկը։',
    'teacher.exportCsv': 'Արտահանել ցուցակը (CSV)',

    'admin.title': 'Օգտատերեր',
    'admin.subtitle': 'Նշանակեք և հանեք «ուսուցիչ» դերը։ «Ադմին» դերն այստեղից չի փոխվում։',
    'admin.searchPlaceholder': 'Որոնել ըստ անվան, էլ. հասցեի կամ դասարանի...',
    'admin.loadError': 'Չհաջողվեց բեռնել օգտատերերին։',
    'admin.empty': 'Օգտատերեր չեն գտնվել։',
    'admin.classLabel': 'դասարան՝ ',
    'admin.makeTeacher': 'Դարձնել ուսուցիչ',
    'admin.removeTeacher': 'Հանել ուսուցչի դերը',
    'admin.managedManually': 'կառավարվում է ձեռքով',
    'admin.thatsYou': 'սա դուք եք',
    'admin.roleError': 'Չհաջողվեց փոխել դերը՝ ',
    'admin.statsTitle': 'Վիճակագրություն',
    'admin.statsStudents': 'Աշակերտներ',
    'admin.statsTeachers': 'Ուսուցիչներ',
    'admin.statsPortfolioItems': 'Աշխատանքներ պորտֆոլիոներում',
    'admin.statsEvents': 'Միջոցառումներ',
    'admin.statsRegistrations': 'Գրանցումներ միջոցառումների',
    'admin.logTitle': 'Դերերի փոփոխությունների պատմություն',
    'admin.logEmpty': 'Փոփոխություններ դեռ չկան։',
    'admin.logChangedBy': 'փոփոխեց՝ ',

    'announcements.title': 'Ծանուցումներ',
    'announcements.subtitle': 'Դպրոցի նորություններն ու հայտարարությունները։',
    'announcements.createTitle': 'Ավելացնել ծանուցում',
    'announcements.titleLabel': 'Վերնագիր',
    'announcements.bodyLabel': 'Տեքստ',
    'announcements.publish': 'Հրապարակել',
    'announcements.publishing': 'Հրապարակում ենք...',
    'announcements.empty': 'Ծանուցումներ դեռ չկան։',
    'announcements.loadError': 'Չհաջողվեց բեռնել ծանուցումները։',
    'announcements.deleteConfirm': 'Ջնջե՞լ այս ծանուցումը։',
    'announcements.by': 'հրապարակեց՝ ',
    'announcements.error': 'Սխալ՝ ',
  },

  ru: {
    brand: 'Школьное портфолио',
    'nav.dashboard': 'Моё портфолио',
    'nav.calendar': 'Календарь',
    'nav.announcements': 'Новости',
    'nav.teacher': 'Учителю',
    'nav.admin': 'Админ',
    logout: 'Выйти',
    'role.student': 'ученик',
    'role.teacher': 'учитель',
    'role.admin': 'админ',

    'login.title': 'Школьное портфолио',
    'login.subtitle': 'Войдите, чтобы открыть личный кабинет.',
    'login.email': 'Email',
    'login.password': 'Пароль',
    'login.submit': 'Войти',
    'login.submitting': 'Входим...',
    'login.error': 'Не удалось войти: проверьте email и пароль.',
    'login.noAccount': 'Ещё нет аккаунта?',
    'login.register': 'Зарегистрироваться',
    'login.forgotPassword': 'Забыли пароль?',

    'forgot.title': 'Восстановление пароля',
    'forgot.subtitle': 'Введите email — пришлём ссылку для смены пароля.',
    'forgot.email': 'Email',
    'forgot.submit': 'Отправить ссылку',
    'forgot.submitting': 'Отправляем...',
    'forgot.success': 'Если аккаунт с таким email существует, на него отправлено письмо со ссылкой для смены пароля.',
    'forgot.error': 'Не удалось отправить. Попробуйте ещё раз.',
    'forgot.backToLogin': 'Вернуться ко входу',

    'reset.title': 'Новый пароль',
    'reset.subtitle': 'Введите новый пароль.',
    'reset.newPassword': 'Новый пароль',
    'reset.confirmPassword': 'Повторите пароль',
    'reset.submit': 'Сохранить новый пароль',
    'reset.submitting': 'Сохраняем...',
    'reset.success': 'Пароль изменён. Теперь можно войти.',
    'reset.error': 'Не удалось изменить пароль: ',
    'reset.mismatch': 'Пароли не совпадают.',
    'reset.invalidLink': 'Ссылка недействительна или устарела. Запросите новую.',

    'register.title': 'Регистрация',
    'register.subtitle': 'Создайте аккаунт ученика.',
    'register.firstName': 'Имя',
    'register.lastName': 'Фамилия',
    'register.class': 'Класс',
    'register.classPlaceholder': 'например, 10-Б',
    'register.email': 'Email',
    'register.password': 'Пароль',
    'register.passwordHint': 'Минимум 6 символов.',
    'register.submit': 'Зарегистрироваться',
    'register.submitting': 'Регистрируем...',
    'register.errorPrefix': 'Не удалось зарегистрироваться: ',
    'register.success': 'Аккаунт создан. Проверьте почту и подтвердите email, затем войдите.',
    'register.haveAccount': 'Уже есть аккаунт?',
    'register.login': 'Войти',

    'dashboard.tabPortfolio': 'Портфолио',
    'dashboard.tabEvents': 'Мои записи',
    'dashboard.title': 'Моё портфолио',
    'dashboard.addItem': '+ Добавить работу',
    'dashboard.publicLink': 'Публичная ссылка на ваше портфолио: ',
    'dashboard.formTitleNew': 'Новая работа',
    'dashboard.formTitleEdit': 'Редактировать работу',
    'dashboard.avatarLabel': 'Ваше фото',
    'dashboard.avatarUpload': 'Изменить фото',
    'dashboard.avatarUploading': 'Загружаем...',
    'dashboard.avatarError': 'Не удалось загрузить фото: ',
    'dashboard.qrLabel': 'QR-код вашего портфолио',
    'dashboard.qrHint': 'Покажите этот код, чтобы другие быстро открыли ваше портфолио.',
    'item.eventLabel': 'Связать с мероприятием, в котором участвовали (необязательно)',
    'item.eventNone': '— нет —',
    'item.linkedEvent': 'Участвовал(а) в мероприятии: ',
    'item.attachmentsLabel': 'Файлы и ссылки',
    'item.addFile': '+ Файл',
    'item.addLink': '+ Ссылка',
    'item.existingAttachments': 'Прикреплённые файлы/ссылки',
    'item.attachmentDeleteConfirm': 'Удалить это вложение?',
    'item.titleLabel': 'Название',
    'item.categoryLabel': 'Категория',
    'category.project': 'Проект',
    'category.achievement': 'Достижение',
    'category.certificate': 'Сертификат',
    'category.creative': 'Творческая работа',
    'item.dateLabel': 'Дата',
    'item.descriptionLabel': 'Описание',
    'item.fileLabel': 'Файл (фото / документ, необязательно)',
    'item.existingFileHint': 'Уже прикреплён файл. Выберите новый, чтобы заменить его.',
    'item.linkLabel': 'Или внешняя ссылка (необязательно)',
    save: 'Сохранить',
    saving: 'Сохраняем...',
    cancel: 'Отмена',
    'item.saveError': 'Ошибка сохранения: ',
    'portfolio.empty': 'Пока пусто. Добавьте первую работу в портфолио.',
    'portfolio.loadError': 'Не удалось загрузить портфолио.',
    edit: 'Изменить',
    delete: 'Удалить',
    'item.deleteConfirm': 'Удалить эту работу из портфолио?',
    'item.deleteError': 'Не удалось удалить: ',
    openFile: 'Открыть файл',
    externalLink: 'Внешняя ссылка',
    'events.myTitle': 'Мои записи на события',
    'events.empty': 'Вы пока не записаны ни на одно событие.',
    'events.viewCalendar': 'Посмотреть календарь',
    'events.cancelReg': 'Отменить запись',
    'events.cancelConfirm': 'Отменить запись на это событие?',
    'events.cancelError': 'Не удалось отменить запись: ',
    'events.loadError': 'Не удалось загрузить записи.',

    'portfolio.pageTitle': 'Портфолио ученика',
    'portfolio.noId': 'Ссылка на портфолио не указана.',
    'portfolio.notFound': 'Портфолио не найдено.',
    'portfolio.classLabel': 'Класс: ',
    'portfolio.filterAll': 'Все',
    'comment.label': 'Комментарии учителя',
    'comment.placeholder': 'Ваш комментарий...',
    'comment.submit': 'Добавить комментарий',
    'comment.deleteConfirm': 'Удалить этот комментарий?',

    'calendar.title': 'Календарь событий',
    'calendar.subtitle': 'Все предстоящие события и презентации школы.',
    'calendar.loadError': 'Не удалось загрузить события.',
    'calendar.empty': 'Пока нет запланированных событий.',
    'calendar.organizer': 'Организатор: ',
    'calendar.registeredSuffix': ' записано',
    'calendar.full': 'Мест нет',
    'calendar.register': 'Записаться',
    'calendar.registerError': 'Не удалось записаться: ',

    'teacher.tabEvents': 'Мои события',
    'teacher.tabPortfolios': 'Портфолио учеников',
    'teacher.createTitle': 'Создать событие',
    'event.titleLabel': 'Название',
    'event.descriptionLabel': 'Описание',
    'event.datetimeLabel': 'Дата и время',
    'event.locationLabel': 'Место',
    'event.maxLabel': 'Максимум участников (необязательно)',
    'event.create': 'Создать событие',
    'event.creating': 'Создаём...',
    'event.error': 'Ошибка: ',
    'teacher.myEventsTitle': 'Мои события и записавшиеся',
    'teacher.myEventsEmpty': 'Вы пока не создали ни одного события.',
    'teacher.eventsLoadError': 'Не удалось загрузить события.',
    'teacher.registeredLabel': 'Записались: ',
    'teacher.noneRegistered': 'пока никто не записался',
    'event.deleteConfirm': 'Удалить это событие? Все записи на него тоже удалятся.',
    'event.delete': 'Удалить событие',
    'teacher.searchPlaceholder': 'Поиск по имени, фамилии или классу...',
    'teacher.studentsEmpty': 'Ученики не найдены.',
    'teacher.classLabel': 'Класс: ',
    'teacher.openPortfolio': 'Открыть портфолио',
    'teacher.studentsLoadError': 'Не удалось загрузить список учеников.',
    'teacher.exportCsv': 'Экспорт списка (CSV)',

    'admin.title': 'Пользователи',
    'admin.subtitle': 'Назначайте и снимайте роль «учитель». Роль «админ» отсюда не меняется.',
    'admin.searchPlaceholder': 'Поиск по имени, email или классу...',
    'admin.loadError': 'Не удалось загрузить пользователей.',
    'admin.empty': 'Пользователи не найдены.',
    'admin.classLabel': 'класс: ',
    'admin.makeTeacher': 'Сделать учителем',
    'admin.removeTeacher': 'Снять роль учителя',
    'admin.managedManually': 'управляется вручную',
    'admin.thatsYou': 'это вы',
    'admin.roleError': 'Не удалось изменить роль: ',
    'admin.statsTitle': 'Статистика',
    'admin.statsStudents': 'Учеников',
    'admin.statsTeachers': 'Учителей',
    'admin.statsPortfolioItems': 'Работ в портфолио',
    'admin.statsEvents': 'Мероприятий',
    'admin.statsRegistrations': 'Регистраций на мероприятия',
    'admin.logTitle': 'История изменений ролей',
    'admin.logEmpty': 'Изменений пока нет.',
    'admin.logChangedBy': 'изменил: ',

    'announcements.title': 'Новости',
    'announcements.subtitle': 'Новости и объявления школы.',
    'announcements.createTitle': 'Добавить объявление',
    'announcements.titleLabel': 'Заголовок',
    'announcements.bodyLabel': 'Текст',
    'announcements.publish': 'Опубликовать',
    'announcements.publishing': 'Публикуем...',
    'announcements.empty': 'Пока нет объявлений.',
    'announcements.loadError': 'Не удалось загрузить объявления.',
    'announcements.deleteConfirm': 'Удалить это объявление?',
    'announcements.by': 'опубликовал(а): ',
    'announcements.error': 'Ошибка: ',
  },
};

function getLang() {
  return localStorage.getItem('site_lang') || 'hy';
}

function setLang(lang) {
  localStorage.setItem('site_lang', lang);
  location.reload();
}

// t(key) — вернуть перевод текущего языка (с откатом на армянский, если ключа нет)
function t(key) {
  const lang = getLang();
  return (translations[lang] && translations[lang][key]) || translations.hy[key] || key;
}

function applyI18n() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
}

function getTheme() {
  return localStorage.getItem('site_theme') || 'light';
}

function setTheme(theme) {
  localStorage.setItem('site_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

function renderTopControls() {
  let bar = document.getElementById('top-controls');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'top-controls';
    document.body.prepend(bar);
  }
  const lang = getLang();
  const theme = getTheme();
  bar.innerHTML = `
    <button type="button" class="top-control-btn" id="lang-toggle-btn">${lang === 'hy' ? 'RU' : 'ՀԱՅ'}</button>
    <button type="button" class="top-control-btn" id="theme-toggle-btn">${theme === 'light' ? '🌙' : '☀️'}</button>
  `;
  document.getElementById('lang-toggle-btn').addEventListener('click', () => {
    setLang(lang === 'hy' ? 'ru' : 'hy');
  });
  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    renderTopControls();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderTopControls();
  applyI18n();
});
