export interface GprWorkItem {
  section: string;
  subsection: string;
  sortOrder: number;
  workName: string;
  unit: string;
  workType: 'НВФ' | 'СПК' | 'BOTH';
}

export const GPR_TEMPLATE: GprWorkItem[] = [
  // 1. НВФ
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 1, workName: 'Геодезическая съёмка фасада', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 2, workName: 'Разработка проекта производства работ (ППР)', unit: 'компл.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 3, workName: 'Вынос осей и разметка на фасаде', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 4, workName: 'Монтаж средств подмащивания (леса, подъёмники)', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 5, workName: 'Подготовка монтажного основания', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 6, workName: 'Очистка стен от загрязнений', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 7, workName: 'Демонтаж старой отделки (при необходимости)', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Подготовительные работы', sortOrder: 8, workName: 'Локальный ремонт монтажного основания', unit: 'м2', workType: 'НВФ' },

  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 9, workName: 'Разметка под установку кронштейнов', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 10, workName: 'Испытание анкеров на вырыв', unit: 'шт.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 11, workName: 'Бурение отверстий под анкеры', unit: 'шт.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 12, workName: 'Установка несущих кронштейнов', unit: 'шт.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 13, workName: 'Установка опорных кронштейнов', unit: 'шт.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 14, workName: 'Установка паронитовых прокладок', unit: 'шт.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 15, workName: 'Монтаж вертикальных направляющих профилей', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 16, workName: 'Монтаж горизонтальных направляющих профилей', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 17, workName: 'Монтаж противопожарных отсечек', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Монтаж подконструкции', sortOrder: 18, workName: 'Устройство термокомпенсационных швов', unit: 'м.п.', workType: 'НВФ' },

  { section: 'НВФ', subsection: 'Утепление', sortOrder: 19, workName: 'Монтаж утеплителя (первый слой)', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Утепление', sortOrder: 20, workName: 'Монтаж утеплителя (второй слой)', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Утепление', sortOrder: 21, workName: 'Крепление утеплителя тарельчатыми дюбелями', unit: 'шт.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Утепление', sortOrder: 22, workName: 'Монтаж ветро-влагозащитной мембраны', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Утепление', sortOrder: 23, workName: 'Устройство пароизоляции', unit: 'м2', workType: 'НВФ' },

  { section: 'НВФ', subsection: 'Облицовка', sortOrder: 24, workName: 'Облицовка керамогранитными плитами', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Облицовка', sortOrder: 25, workName: 'Облицовка композитными панелями (АКП)', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Облицовка', sortOrder: 26, workName: 'Облицовка фиброцементными плитами', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Облицовка', sortOrder: 27, workName: 'Облицовка металлокассетами', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Облицовка', sortOrder: 28, workName: 'Облицовка линеарными панелями', unit: 'м2', workType: 'НВФ' },

  { section: 'НВФ', subsection: 'Примыкания и завершение', sortOrder: 29, workName: 'Монтаж оконных откосов', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Примыкания и завершение', sortOrder: 30, workName: 'Монтаж дверных откосов', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Примыкания и завершение', sortOrder: 31, workName: 'Монтаж отливов', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Примыкания и завершение', sortOrder: 32, workName: 'Монтаж парапетных крышек', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Примыкания и завершение', sortOrder: 33, workName: 'Герметизация швов и стыков', unit: 'м.п.', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Примыкания и завершение', sortOrder: 34, workName: 'Демонтаж средств подмащивания', unit: 'м2', workType: 'НВФ' },
  { section: 'НВФ', subsection: 'Примыкания и завершение', sortOrder: 35, workName: 'Уборка строительного мусора', unit: 'компл.', workType: 'НВФ' },

  // 2. СПК
  { section: 'СПК', subsection: 'Подготовительные работы', sortOrder: 36, workName: 'Геодезическая съёмка фасада', unit: 'м2', workType: 'СПК' },
  { section: 'СПК', subsection: 'Подготовительные работы', sortOrder: 37, workName: 'Разработка рабочей документации', unit: 'компл.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Подготовительные работы', sortOrder: 38, workName: 'Вынос осей под СПК + разметка на фасаде', unit: 'м2', workType: 'СПК' },
  { section: 'СПК', subsection: 'Подготовительные работы', sortOrder: 39, workName: 'Монтаж средств подмащивания', unit: 'м2', workType: 'СПК' },
  { section: 'СПК', subsection: 'Подготовительные работы', sortOrder: 40, workName: 'Подготовка проёмов и монтажного основания', unit: 'м2', workType: 'СПК' },

  { section: 'СПК', subsection: 'Монтаж несущего каркаса', sortOrder: 41, workName: 'Установка закладных элементов', unit: 'шт.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Монтаж несущего каркаса', sortOrder: 42, workName: 'Монтаж кронштейнов крепления СПК', unit: 'шт.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Монтаж несущего каркаса', sortOrder: 43, workName: 'Монтаж вертикальных стоек (импостов)', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Монтаж несущего каркаса', sortOrder: 44, workName: 'Монтаж горизонтальных ригелей', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Монтаж несущего каркаса', sortOrder: 45, workName: 'Установка термомостов', unit: 'шт.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Монтаж несущего каркаса', sortOrder: 46, workName: 'Монтаж противопожарных коробов', unit: 'м.п.', workType: 'СПК' },

  { section: 'СПК', subsection: 'Заполнение и остекление', sortOrder: 47, workName: 'Монтаж утепления непрозрачной зоны', unit: 'м2', workType: 'СПК' },
  { section: 'СПК', subsection: 'Заполнение и остекление', sortOrder: 48, workName: 'Монтаж стеклопакетов (прозрачная зона)', unit: 'м2', workType: 'СПК' },
  { section: 'СПК', subsection: 'Заполнение и остекление', sortOrder: 49, workName: 'Установка штапиков', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Заполнение и остекление', sortOrder: 50, workName: 'Установка уплотнителей EPDM', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Заполнение и остекление', sortOrder: 51, workName: 'Монтаж декоративных крышек', unit: 'м.п.', workType: 'СПК' },

  { section: 'СПК', subsection: 'Герметизация и примыкания', sortOrder: 52, workName: 'Герметизация структурного шва', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Герметизация и примыкания', sortOrder: 53, workName: 'Герметизация наружных швов', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Герметизация и примыкания', sortOrder: 54, workName: 'Установка примыканий к стенам', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Герметизация и примыкания', sortOrder: 55, workName: 'Монтаж отливов', unit: 'м.п.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Герметизация и примыкания', sortOrder: 56, workName: 'Монтаж откосов', unit: 'м.п.', workType: 'СПК' },

  { section: 'СПК', subsection: 'Окна и двери', sortOrder: 57, workName: 'Монтаж алюминиевых окон', unit: 'шт.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Окна и двери', sortOrder: 58, workName: 'Монтаж алюминиевых дверей', unit: 'шт.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Окна и двери', sortOrder: 59, workName: 'Установка фурнитуры', unit: 'компл.', workType: 'СПК' },
  { section: 'СПК', subsection: 'Окна и двери', sortOrder: 60, workName: 'Регулировка открывающихся элементов', unit: 'шт.', workType: 'СПК' },
];

export const OBJECT_STATUSES = {
  NEW: { label: 'Новый', color: '#6b7280' },
  IN_PROGRESS: { label: 'В работе', color: '#3b82f6' },
  COMPLETED: { label: 'Завершён', color: '#22c55e' },
  PAUSED: { label: 'Приостановлен', color: '#eab308' },
  CANCELLED: { label: 'Отменён', color: '#ef4444' },
};

export const WORK_TYPES = [
  { value: 'НВФ', label: 'Навесной вентилируемый фасад (НВФ)' },
  { value: 'СПК', label: 'Светопрозрачные конструкции (СПК)' },
];
