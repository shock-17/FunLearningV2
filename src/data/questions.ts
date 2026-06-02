import { Subject, Difficulty } from '../store/useAppStore';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

const generateMathEasy = (): Question[] => {
  return Array.from({ length: 30 }).map((_, i) => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const isAdd = Math.random() > 0.5;
    const ans = isAdd ? a + b : a - b;
    const text = isAdd ? `${a} + ${b} = ?` : `${a} - ${b} = ?`;
    const opts = [ans.toString(), (ans + 1).toString(), (ans - 1).toString()].sort(() => Math.random() - 0.5);
    return { id: `me-${i}`, text, options: opts, correctAnswer: ans.toString() };
  });
};

const mathMediumBank: Question[] = [
  { id: 'mm-1', text: 'What is 1/2 + 1/4?', options: ['3/4', '1/6', '2/6'], correctAnswer: '3/4' },
  { id: 'mm-2', text: 'Which is a factor of 15?', options: ['5', '6', '2'], correctAnswer: '5' },
  { id: 'mm-3', text: 'Area of a rectangle 5x4?', options: ['20', '9', '24'], correctAnswer: '20' },
  { id: 'mm-4', text: 'What is 3 * 7?', options: ['21', '24', '18'], correctAnswer: '21' },
  { id: 'mm-5', text: 'Perimeter of a square with side 3?', options: ['12', '9', '6'], correctAnswer: '12' },
  { id: 'mm-6', text: 'What is 1/3 of 12?', options: ['4', '3', '6'], correctAnswer: '4' },
  { id: 'mm-7', text: 'Which is a prime number?', options: ['7', '9', '15'], correctAnswer: '7' },
  { id: 'mm-8', text: 'Solve: 2x = 10', options: ['5', '8', '12'], correctAnswer: '5' },
  { id: 'mm-9', text: 'How many straight edges does a cube have?', options: ['12', '8', '6'], correctAnswer: '12' },
  { id: 'mm-10', text: 'What is 50% of 80?', options: ['40', '50', '20'], correctAnswer: '40' },
  { id: 'mm-11', text: '1/4 + 2/4 = ?', options: ['3/4', '3/8', '2/8'], correctAnswer: '3/4' },
  { id: 'mm-12', text: 'What is 8 * 6?', options: ['48', '56', '54'], correctAnswer: '48' },
  { id: 'mm-13', text: 'Area of a triangle: base=4, height=3', options: ['6', '12', '7'], correctAnswer: '6' },
  { id: 'mm-14', text: 'Solve: x - 5 = 7', options: ['12', '2', '10'], correctAnswer: '12' },
  { id: 'mm-15', text: 'What is 81 / 9?', options: ['9', '8', '7'], correctAnswer: '9' },
];

const mathHardBank: Question[] = [
  { id: 'mh-1', text: 'Solve for x: x² = 16 (x > 0)', options: ['4', '8', '16'], correctAnswer: '4' },
  { id: 'mh-2', text: 'What is the square root of 144?', options: ['12', '14', '16'], correctAnswer: '12' },
  { id: 'mh-3', text: 'If y = 2x + 1, what is y when x=3?', options: ['7', '6', '5'], correctAnswer: '7' },
  { id: 'mh-4', text: 'Pythagorean theorem: 3, 4, ?', options: ['5', '6', '7'], correctAnswer: '5' },
  { id: 'mh-5', text: 'What is 3³?', options: ['27', '9', '81'], correctAnswer: '27' },
  { id: 'mh-6', text: 'Median of [1, 5, 9]', options: ['5', '1', '9'], correctAnswer: '5' },
  { id: 'mh-7', text: 'Solve: 3x - 2 = 10', options: ['4', '3', '6'], correctAnswer: '4' },
  { id: 'mh-8', text: 'Probability of a coin flip heads 3 times?', options: ['1/8', '1/6', '1/4'], correctAnswer: '1/8' },
  { id: 'mh-9', text: 'Volume of box: 2x3x4', options: ['24', '12', '9'], correctAnswer: '24' },
  { id: 'mh-10', text: 'Sum of interior angles of a triangle?', options: ['180°', '360°', '90°'], correctAnswer: '180°' },
];

const englishEasyBank: Question[] = [
  { id: 'ee-1', text: 'Which word starts with "A"?', options: ['Apple', 'Dog', 'Cat'], correctAnswer: 'Apple' },
  { id: 'ee-2', text: 'Find the letter "B"', options: ['B', 'D', 'P'], correctAnswer: 'B' },
  { id: 'ee-3', text: 'Which word means small?', options: ['Little', 'Huge', 'Giant'], correctAnswer: 'Little' },
  { id: 'ee-4', text: 'Opposite of "Up"', options: ['Down', 'Left', 'Fast'], correctAnswer: 'Down' },
  { id: 'ee-5', text: 'What animal says "Meow"?', options: ['Cat', 'Dog', 'Cow'], correctAnswer: 'Cat' },
  { id: 'ee-6', text: 'Which word starts with "C"?', options: ['Car', 'Bus', 'Train'], correctAnswer: 'Car' },
  { id: 'ee-7', text: 'Find the lowercase "e"', options: ['e', 'E', 'c'], correctAnswer: 'e' },
  { id: 'ee-8', text: 'Opposite of "Hot"', options: ['Cold', 'Warm', 'Sun'], correctAnswer: 'Cold' },
  { id: 'ee-9', text: 'What color is the sky?', options: ['Blue', 'Green', 'Red'], correctAnswer: 'Blue' },
  { id: 'ee-10', text: 'Opposite of "Fast"', options: ['Slow', 'Quick', 'Run'], correctAnswer: 'Slow' },
];

const englishMediumBank: Question[] = [
  { id: 'em-1', text: 'What type of animal is a frog?', options: ['Amphibian', 'Mammal', 'Reptile'], correctAnswer: 'Amphibian' },
  { id: 'em-2', text: 'Which word is a verb?', options: ['Run', 'Blue', 'House'], correctAnswer: 'Run' },
  { id: 'em-3', text: 'How do you spell the number 8?', options: ['Eight', 'Ate', 'Eigth'], correctAnswer: 'Eight' },
  { id: 'em-4', text: 'Synonym for "Happy"', options: ['Joyful', 'Sad', 'Angry'], correctAnswer: 'Joyful' },
  { id: 'em-5', text: 'What do bees make?', options: ['Honey', 'Milk', 'Silk'], correctAnswer: 'Honey' },
  { id: 'em-6', text: 'Which is a noun?', options: ['Table', 'Jump', 'Quickly'], correctAnswer: 'Table' },
  { id: 'em-7', text: 'Plural of "Mouse"', options: ['Mice', 'Mouses', 'Meese'], correctAnswer: 'Mice' },
  { id: 'em-8', text: 'Synonym for "Fast"', options: ['Quick', 'Slow', 'Heavy'], correctAnswer: 'Quick' },
  { id: 'em-9', text: 'A baby dog is a...', options: ['Puppy', 'Kitten', 'Cub'], correctAnswer: 'Puppy' },
  { id: 'em-10', text: 'Which is an adjective?', options: ['Red', 'Run', 'Apple'], correctAnswer: 'Red' },
  { id: 'em-11', text: 'Rhymes with "Cat"', options: ['Bat', 'Dog', 'Bird'], correctAnswer: 'Bat' },
  { id: 'em-12', text: 'Past tense of "Run"', options: ['Ran', 'Running', 'Runned'], correctAnswer: 'Ran' },
  { id: 'em-13', text: 'What do birds live in?', options: ['Nest', 'Hive', 'Cave'], correctAnswer: 'Nest' },
  { id: 'em-14', text: 'Opposite of "Loud"', options: ['Quiet', 'Noisy', 'Bright'], correctAnswer: 'Quiet' },
  { id: 'em-15', text: 'Rhymes with "Light"', options: ['Night', 'Day', 'Late'], correctAnswer: 'Night' },
];

const englishHardBank: Question[] = [
  { id: 'eh-1', text: 'Complete: She ___ going to the store.', options: ['is', 'are', 'am'], correctAnswer: 'is' },
  { id: 'eh-2', text: 'Which is an adverb?', options: ['Quickly', 'House', 'Beautiful'], correctAnswer: 'Quickly' },
  { id: 'eh-3', text: 'Identify the preposition: The cat is under the table.', options: ['under', 'cat', 'table'], correctAnswer: 'under' },
  { id: 'eh-4', text: 'Meaning of "enormous"?', options: ['Very large', 'Very small', 'Angry'], correctAnswer: 'Very large' },
  { id: 'eh-5', text: 'Plural of "Goose"?', options: ['Geese', 'Gooses', 'Geese'], correctAnswer: 'Geese' },
  { id: 'eh-6', text: ' Past participle of "Eat"?', options: ['Eaten', 'Ate', 'Eating'], correctAnswer: 'Eaten' },
  { id: 'eh-7', text: 'Which is a conjunction?', options: ['And', 'Run', 'Blue'], correctAnswer: 'And' },
  { id: 'eh-8', text: 'Identify the pronoun: "He goes to school"', options: ['He', 'goes', 'school'], correctAnswer: 'He' },
  { id: 'eh-9', text: 'Correct spelling?', options: ['Definitely', 'Definately', 'Definatly'], correctAnswer: 'Definitely' },
  { id: 'eh-10', text: 'Antonym of "Transparent"', options: ['Opaque', 'Clear', 'Glassy'], correctAnswer: 'Opaque' },
];

const mandarinEasyBank: Question[] = [
  { id: 'mae-1', text: 'What is 1 in Mandarin?', options: ['一 (Yī)', '二 (Èr)', '三 (Sān)'], correctAnswer: '一 (Yī)' },
  { id: 'mae-2', text: 'How to say "Hello"?', options: ['你好 (Nǐ hǎo)', '再见 (Zàijiàn)', '谢谢 (Xièxiè)'], correctAnswer: '你好 (Nǐ hǎo)' },
  { id: 'mae-3', text: 'What is 2 in Mandarin?', options: ['二 (Èr)', '四 (Sì)', '五 (Wǔ)'], correctAnswer: '二 (Èr)' },
  { id: 'mae-4', text: 'What is 3 in Mandarin?', options: ['三 (Sān)', '一 (Yī)', '六 (Liù)'], correctAnswer: '三 (Sān)' },
  { id: 'mae-5', text: 'How to say "Thank you"?', options: ['谢谢 (Xièxiè)', '对不起 (Duìbùqǐ)', '你好 (Nǐ hǎo)'], correctAnswer: '谢谢 (Xièxiè)' },
  { id: 'mae-6', text: 'What is 5 in Mandarin?', options: ['五 (Wǔ)', '三 (Sān)', '七 (Qī)'], correctAnswer: '五 (Wǔ)' },
  { id: 'mae-7', text: 'What is 10 in Mandarin?', options: ['十 (Shí)', '八 (Bā)', '九 (Jiǔ)'], correctAnswer: '十 (Shí)' },
  { id: 'mae-8', text: 'What is "Goodbye"?', options: ['再见 (Zàijiàn)', '你好 (Nǐ hǎo)', '不客气 (Bù kèqì)'], correctAnswer: '再见 (Zàijiàn)' },
  { id: 'mae-9', text: 'What is 8 in Mandarin?', options: ['八 (Bā)', '四 (Sì)', '二 (Èr)'], correctAnswer: '八 (Bā)' },
  { id: 'mae-10', text: 'What is "Sorry"?', options: ['对不起 (Duìbùqǐ)', '谢谢 (Xièxiè)', '再见 (Zàijiàn)'], correctAnswer: '对不起 (Duìbùqǐ)' },
];

const mandarinMediumBank: Question[] = [
  { id: 'mam-1', text: 'Translate "I am a student" (我是学生)', options: ['Wǒ shì xuéshēng', 'Wǒ shì lǎoshī', 'Tā shì xuéshēng'], correctAnswer: 'Wǒ shì xuéshēng' },
  { id: 'mam-2', text: 'Which tone is flat/high? (e.g., mā)', options: ['First', 'Second', 'Third'], correctAnswer: 'First' },
  { id: 'mam-3', text: 'What animal is 狗 (gǒu)?', options: ['Dog', 'Cat', 'Bird'], correctAnswer: 'Dog' },
  { id: 'mam-4', text: 'Identify the character for "Water"', options: ['水 (shuǐ)', '火 (huǒ)', '木 (mù)'], correctAnswer: '水 (shuǐ)' },
  { id: 'mam-5', text: 'What does "今天" (jīntiān) mean?', options: ['Today', 'Tomorrow', 'Yesterday'], correctAnswer: 'Today' },
  { id: 'mam-6', text: 'What animal is 猫 (māo)?', options: ['Cat', 'Dog', 'Fish'], correctAnswer: 'Cat' },
  { id: 'mam-7', text: 'Character for "Fire"', options: ['火 (huǒ)', '水 (shuǐ)', '金 (jīn)'], correctAnswer: '火 (huǒ)' },
  { id: 'mam-8', text: 'What does "明天" (míngtiān) mean?', options: ['Tomorrow', 'Yesterday', 'Today'], correctAnswer: 'Tomorrow' },
  { id: 'mam-9', text: 'Translate "I love you" (我爱你)', options: ['Wǒ ài nǐ', 'Wǒ xǐhuān nǐ', 'Nǐ hǎo'], correctAnswer: 'Wǒ ài nǐ' },
  { id: 'mam-10', text: 'Which tone falls then rises? (e.g., mǎ)', options: ['Third', 'Fourth', 'Second'], correctAnswer: 'Third' },
  { id: 'mam-11', text: 'What animal is 鸟 (niǎo)?', options: ['Bird', 'Fish', 'Horse'], correctAnswer: 'Bird' },
  { id: 'mam-12', text: 'Character for "Person"', options: ['人 (rén)', '大 (dà)', '木 (mù)'], correctAnswer: '人 (rén)' },
  { id: 'mam-13', text: 'What does "吃" (chī) mean?', options: ['To eat', 'To drink', 'To sleep'], correctAnswer: 'To eat' },
  { id: 'mam-14', text: 'Translate "Good morning"', options: ['早上好 (zǎoshang hǎo)', '晚上好 (wǎnshang hǎo)', '你好 (nǐ hǎo)'], correctAnswer: '早上好 (zǎoshang hǎo)' },
  { id: 'mam-15', text: 'Character for "Sun/Day"', options: ['日 (rì)', '月 (yuè)', '水 (shuǐ)'], correctAnswer: '日 (rì)' },
];

const mandarinHardBank: Question[] = [
  { id: 'mah-1', text: 'Correct measure word for books (一_书)', options: ['本 (běn)', '个 (gè)', '只 (zhī)'], correctAnswer: '本 (běn)' },
  { id: 'mah-2', text: 'What does "为什么" (wèishénme) mean?', options: ['Why', 'What', 'Where'], correctAnswer: 'Why' },
  { id: 'mah-3', text: 'Meaning of particle "了" (le)', options: ['Completed action', 'Possessive', 'Question'], correctAnswer: 'Completed action' },
  { id: 'mah-4', text: 'Translate "図書館" (túshūguǎn)', options: ['Library', 'Restaurant', 'School'], correctAnswer: 'Library' },
  { id: 'mah-5', text: 'Measure word for flat items like tables (一_桌子)', options: ['张 (zhāng)', '把 (bǎ)', '条 (tiáo)'], correctAnswer: '张 (zhāng)' },
  { id: 'mah-6', text: 'What does particle "的" (de) indicate?', options: ['Possession', 'Past tense', 'Location'], correctAnswer: 'Possession' },
  { id: 'mah-7', text: 'Translate "电脑" (diànnǎo)', options: ['Computer', 'Television', 'Telephone'], correctAnswer: 'Computer' },
  { id: 'mah-8', text: 'How to ask "Where are you going?"', options: ['你去哪儿? (Nǐ qù nǎ\'er?)', '你是谁? (Nǐ shì shéi?)', '你叫什么? (Nǐ jiào shénme?)'], correctAnswer: '你去哪儿? (Nǐ qù nǎ\'er?)' },
  { id: 'mah-9', text: 'Measure word for long flexible things (一_鱼)', options: ['条 (tiáo)', '个 (gè)', '只 (zhī)'], correctAnswer: '条 (tiáo)' },
  { id: 'mah-10', text: 'Translate "医院" (yīyuàn)', options: ['Hospital', 'Bank', 'Park'], correctAnswer: 'Hospital' },
];

export function getQuestions(subject: Subject, difficulty: Difficulty, count: number): Question[] {
  let bank: Question[] = [];
  if (subject === 'Math') {
    if (difficulty === 'Easy') bank = generateMathEasy();
    if (difficulty === 'Medium') bank = mathMediumBank;
    if (difficulty === 'Hard') bank = mathHardBank;
  } else if (subject === 'English') {
    if (difficulty === 'Easy') bank = englishEasyBank;
    if (difficulty === 'Medium') bank = englishMediumBank;
    if (difficulty === 'Hard') bank = englishHardBank;
  } else if (subject === 'Mandarin') {
    if (difficulty === 'Easy') bank = mandarinEasyBank;
    if (difficulty === 'Medium') bank = mandarinMediumBank;
    if (difficulty === 'Hard') bank = mandarinHardBank;
  }
  
  // Shuffle and slice
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
