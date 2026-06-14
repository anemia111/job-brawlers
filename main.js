(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const GRAVITY = 0.62;
  const MAX_FALL_SPEED = 17;
  const PLAYER_W = 30;
  const PLAYER_H = 46;
  const PLAYER_DRAW_W = 40;
  const PLAYER_DRAW_H = 56;
  const STARTING_STOCKS = 3;
  const PLAYER_COLORS = ["#ff5a5f", "#18a4e0", "#7ac943", "#ffb000"];
  const BLAST_ZONE = { left: -300, right: W + 300, top: -340, bottom: H + 300 };
  const ULTIMATE_COOLDOWN = 60;
  const ATTACK_DATA = {
    normalAttack: { damage: 5, baseKnockback: 4, damageScale: 0.085 },
    strongAttack: { damage: 12, baseKnockback: 9, damageScale: 0.145 },
    upAttack: { damage: 7, baseKnockback: 6, damageScale: 0.105 },
    downAttack: { damage: 7, baseKnockback: 5, damageScale: 0.095 },
    upStrongAttack: { damage: 13, baseKnockback: 10, damageScale: 0.15 },
    downStrongAttack: { damage: 11, baseKnockback: 8, damageScale: 0.13 },
    airAttack: { damage: 7, baseKnockback: 6, damageScale: 0.11 },
    airStrongAttack: { damage: 9, baseKnockback: 8, damageScale: 0.125 },
    recoveryMove: { damage: 6, baseKnockback: 5, damageScale: 0.08 },
    projectileAttack: { damage: 4, baseKnockback: 3, damageScale: 0.065 },
    skillAttack: { damage: 5, baseKnockback: 4, damageScale: 0.075 },
    ultimateAttack: { damage: 25, baseKnockback: 14, damageScale: 0.16 }
  };

  const localControls = {
    left: "KeyA",
    right: "KeyD",
    up: "KeyW",
    down: "KeyS",
    jump: "Space",
    normal: "KeyK",
    strong: "KeyL",
    grab: "KeyU",
    skill: "KeyH",
    ultimate: "KeyJ",
    guard: "KeyI",
    dodge: "KeyO"
  };
  const controls = [localControls];
  const CPU_DIFFICULTIES = ["Easy", "Normal", "Hard"];
  const ARCHETYPE_LABELS = {
    melee: "近距離",
    ranged: "遠距離",
    midrange: "中距離",
    technical: "特殊",
    control: "制御",
    mobility: "機動",
    support: "支援",
    heavy: "重量",
    defense: "防御"
  };

  const characters = [
    {
      id: "salaryman",
      name: "会議のサラリーマン",
      job: "会社員",
      concept: "資料と会議で戦う平均型キャラ",
      speed: 4.2,
      jumpPower: 12,
      weight: 1.0,
      normalAttack: "名刺スラッシュ",
      strongAttack: "稟議書スタンプ",
      skill: "緊急会議フィールド",
      color: "#4f7cac"
    },
    {
      id: "programmer",
      name: "徹夜のプログラマー",
      job: "プログラマー",
      concept: "バグとコードで戦うテクニカルキャラ",
      speed: 4.0,
      jumpPower: 11.5,
      weight: 0.95,
      normalAttack: "バグ投げ",
      strongAttack: "キーボードクラッシュ",
      skill: "デバッグゾーン",
      color: "#3c6e71"
    },
    {
      id: "chef",
      name: "フライパンシェフ",
      job: "料理人",
      concept: "近距離火力が高いパワーキャラ",
      speed: 3.8,
      jumpPower: 11,
      weight: 1.1,
      normalAttack: "おたまアタック",
      strongAttack: "フライパンホームラン",
      skill: "激辛スープ",
      color: "#e4572e"
    },
    {
      id: "doctor",
      name: "白衣のドクター",
      job: "医師",
      concept: "軽い回復と妨害を持つサポート型",
      speed: 4.1,
      jumpPower: 11.5,
      weight: 1.0,
      normalAttack: "聴診器ウィップ",
      strongAttack: "カルテバインダー",
      skill: "応急処置",
      color: "#58b4ae"
    },
    {
      id: "nurse",
      name: "ナースコールの看護師",
      job: "看護師",
      concept: "素早く味方なしでも粘れる機動型",
      speed: 4.6,
      jumpPower: 12.5,
      weight: 0.9,
      normalAttack: "包帯スピン",
      strongAttack: "ナースコール衝撃波",
      skill: "包帯バリア",
      color: "#f28ab2"
    },
    {
      id: "lawyer",
      name: "異議あり弁護士",
      job: "弁護士",
      concept: "中距離から言葉の圧で吹っ飛ばすキャラ",
      speed: 3.9,
      jumpPower: 11,
      weight: 1.0,
      normalAttack: "書類ビンタ",
      strongAttack: "異議ありショック",
      skill: "証拠提出",
      color: "#7367f0"
    },
    {
      id: "teacher",
      name: "チョークの教師",
      job: "教師",
      concept: "チョーク投げと黒板消しで戦うバランス型",
      speed: 4.1,
      jumpPower: 12,
      weight: 1.0,
      normalAttack: "チョークショット",
      strongAttack: "黒板消しスマッシュ",
      skill: "抜き打ちテスト",
      color: "#2a9d8f"
    },
    {
      id: "firefighter",
      name: "突撃消防士",
      job: "消防士",
      concept: "重めだが復帰力のあるパワーキャラ",
      speed: 3.7,
      jumpPower: 11,
      weight: 1.2,
      normalAttack: "ホースパンチ",
      strongAttack: "消火器バースト",
      skill: "放水ジェット",
      color: "#d62828"
    },
    {
      id: "police",
      name: "交通整理の警察官",
      job: "警察官",
      concept: "相手の動きを止める妨害型",
      speed: 4.2,
      jumpPower: 11.5,
      weight: 1.05,
      normalAttack: "警棒タップ",
      strongAttack: "停止命令",
      skill: "交通規制",
      color: "#1d4e89"
    },
    {
      id: "construction",
      name: "現場の建設作業員",
      job: "建設作業員",
      concept: "重くて吹っ飛びにくいタンク型",
      speed: 3.4,
      jumpPower: 10.5,
      weight: 1.3,
      normalAttack: "レンチスイング",
      strongAttack: "安全第一ハンマー",
      skill: "仮設足場",
      color: "#f4a261"
    },
    {
      id: "delivery",
      name: "爆速配達員",
      job: "配達員",
      concept: "スピード特化の軽量キャラ",
      speed: 5.2,
      jumpPower: 12.5,
      weight: 0.85,
      normalAttack: "段ボール投げ",
      strongAttack: "台車突撃",
      skill: "お急ぎ便ダッシュ",
      color: "#ffb703"
    },
    {
      id: "barista",
      name: "ラテアートのバリスタ",
      job: "バリスタ",
      concept: "コーヒーで相手の動きを乱す中距離型",
      speed: 4.3,
      jumpPower: 12,
      weight: 0.95,
      normalAttack: "豆ショット",
      strongAttack: "熱々ラテスプラッシュ",
      skill: "カフェインブースト",
      color: "#8d6e63"
    },
    {
      id: "hairdresser",
      name: "カリスマ美容師",
      job: "美容師",
      concept: "ハサミとドライヤーで空中戦が強い",
      speed: 4.5,
      jumpPower: 12.8,
      weight: 0.9,
      normalAttack: "ハサミカット",
      strongAttack: "ドライヤーブラスト",
      skill: "ヘアセット回避",
      color: "#ff7eb6"
    },
    {
      id: "farmer",
      name: "豊作の農家",
      job: "農家",
      concept: "設置技と重めの攻撃が得意",
      speed: 3.6,
      jumpPower: 11,
      weight: 1.15,
      normalAttack: "にんじん投げ",
      strongAttack: "くわスマッシュ",
      skill: "野菜トラップ",
      color: "#6a994e"
    },
    {
      id: "researcher",
      name: "実験中の研究者",
      job: "研究者",
      concept: "ランダム性のある薬品攻撃を使う",
      speed: 3.9,
      jumpPower: 11.8,
      weight: 0.95,
      normalAttack: "試験管ショット",
      strongAttack: "フラスコ爆発",
      skill: "謎の実験薬",
      color: "#43aa8b"
    },
    {
      id: "security",
      name: "見回り警備員",
      job: "警備員",
      concept: "防御とカウンターが得意",
      speed: 3.8,
      jumpPower: 11,
      weight: 1.1,
      normalAttack: "懐中電灯フラッシュ",
      strongAttack: "ゲート閉鎖",
      skill: "巡回カウンター",
      color: "#606c38"
    },
    {
      id: "cleaner",
      name: "高速清掃員",
      job: "清掃員",
      concept: "床掃除で滑らせるトリッキーキャラ",
      speed: 4.4,
      jumpPower: 12,
      weight: 0.95,
      normalAttack: "モップスイング",
      strongAttack: "掃除機吸引",
      skill: "ツルツルワックス",
      color: "#00afb9"
    },
    {
      id: "realtor",
      name: "物件紹介の不動産営業",
      job: "不動産営業",
      concept: "足場や位置取りを操る変則キャラ",
      speed: 4.0,
      jumpPower: 11.5,
      weight: 1.0,
      normalAttack: "鍵投げ",
      strongAttack: "契約書アッパー",
      skill: "即入居ワープ",
      color: "#f77f00"
    },
    {
      id: "streamer",
      name: "炎上系配信者",
      job: "動画配信者",
      concept: "注目度で強くなるネタキャラ",
      speed: 4.3,
      jumpPower: 12,
      weight: 0.9,
      normalAttack: "マイク投げ",
      strongAttack: "サムネ詐欺スマッシュ",
      skill: "バズりモード",
      color: "#ef476f"
    },
    {
      id: "accountant",
      name: "決算の税理士",
      job: "税理士",
      concept: "数字と計算で堅実に戦うキャラ",
      speed: 3.8,
      jumpPower: 11,
      weight: 1.0,
      normalAttack: "電卓パンチ",
      strongAttack: "領収書ラッシュ",
      skill: "確定申告バリア",
      color: "#118ab2"
    },
    {
      id: "happy_repeat_student",
      name: "留年教育大学生HAPPY",
      job: "教育学部大学生",
      concept: "教育実習の必要日数が足りず、卒業がじわじわ遠のいている成人大学生。たばこをくわえながらも謎に前向きな逆転型トリックスター。",
      selectDescription: "「単位はある。足りないのは教育実習。卒業は近いようで遠い、たばこをくわえた成人大学生トリックスター。」",
      speed: 4.4,
      jumpPower: 12.2,
      weight: 0.95,
      normalAttack: "指導案投げ",
      strongAttack: "実習日誌スマッシュ",
      skill: "HAPPY教育実習モード",
      color: "#ffd23f"
    }
  ];

  characters.push(
    {
      id: "night_shift_clerk",
      name: "コンビニ夜勤スタッフ",
      job: "コンビニ店員",
      concept: "レジ袋、ホットスナック、深夜テンションで戦う万能型",
      archetype: "midrange",
      speed: 4.3,
      jumpPower: 12.0,
      weight: 0.95,
      normalAttack: "レジ袋スイング",
      strongAttack: "ホットスナックプレス",
      upAttack: "バーコードスキャン上げ",
      downAttack: "品出しスライド",
      upStrongAttack: "深夜シフトアッパー",
      downStrongAttack: "レジ締めスマッシュ",
      airAttack: "レジ袋空中回転",
      recoveryMove: "バックヤード復帰",
      skill: "ワンオペ覚醒",
      tools: ["レジ袋", "バーコードリーダー", "ホットスナック", "商品カゴ"],
      specialAbility: { name: "深夜ワンオペ", description: "残機が1になると一度だけ移動速度が少し上がる。", type: "passive" },
      appearance: { outfitColor: "#1f4f9c", accentColor: "#ff7a00", accessory: "basket", costumeType: "casual", weaponType: "bag", hairStyle: "cap" },
      color: "#1f8dd6"
    },
    {
      id: "station_staff",
      name: "駅員アナウンサー",
      job: "駅員",
      concept: "アナウンスと改札で相手の動きを制御する中距離キャラ",
      archetype: "control",
      speed: 4.0,
      jumpPower: 11.6,
      weight: 1.0,
      normalAttack: "切符パンチ",
      strongAttack: "改札ゲートスマッシュ",
      upAttack: "発車ベル上げ",
      downAttack: "黄色い線スライド",
      upStrongAttack: "終電アッパー",
      downStrongAttack: "改札閉鎖スマッシュ",
      airAttack: "吊り革キック",
      recoveryMove: "快速復帰",
      skill: "遅延アナウンス",
      tools: ["切符", "改札ゲート", "マイク", "発車ベル"],
      specialAbility: { name: "黄色い線の内側", description: "足場の端で少しだけ落下しにくくなる。", type: "passive" },
      appearance: { outfitColor: "#263a5f", accentColor: "#f6c445", accessory: "cap", costumeType: "suit", weaponType: "mic", hairStyle: "cap" },
      color: "#315d89"
    },
    {
      id: "dental_hygienist",
      name: "歯科衛生士",
      job: "歯科衛生士",
      concept: "歯ブラシとミラーで細かく削る軽量キャラ",
      archetype: "mobility",
      speed: 4.7,
      jumpPower: 12.5,
      weight: 0.9,
      normalAttack: "歯ブラシ連打",
      strongAttack: "デンタルミラースマッシュ",
      upAttack: "フロス上げ",
      downAttack: "歯石取りスイープ",
      upStrongAttack: "クリーニングアッパー",
      downStrongAttack: "虫歯チェックスマッシュ",
      airAttack: "フロス空中回転",
      recoveryMove: "診察台ジャンプ",
      skill: "ホワイトニングフラッシュ",
      tools: ["歯ブラシ", "デンタルミラー", "フロス", "ライト"],
      specialAbility: { name: "定期検診", description: "一定時間ダメージを受けないと、次の通常攻撃が少し速くなる。", type: "passive" },
      appearance: { outfitColor: "#e8fbff", accentColor: "#41b8d5", accessory: "mask", costumeType: "doctor", weaponType: "brush", hairStyle: "bob" },
      color: "#62c7d8"
    },
    {
      id: "ryokan_manager",
      name: "旅館の女将",
      job: "旅館スタッフ",
      concept: "お盆とおもてなしで戦う優雅な中距離キャラ",
      archetype: "midrange",
      speed: 3.9,
      jumpPower: 11.3,
      weight: 1.0,
      normalAttack: "お盆スイング",
      strongAttack: "座布団スマッシュ",
      upAttack: "湯けむり上げ",
      downAttack: "畳返し",
      upStrongAttack: "おもてなしアッパー",
      downStrongAttack: "布団敷きスマッシュ",
      airAttack: "浴衣ターン",
      recoveryMove: "露天風呂ジャンプ",
      skill: "おもてなし結界",
      tools: ["お盆", "座布団", "湯のみ", "布団"],
      specialAbility: { name: "おもてなしの間合い", description: "近くに敵が複数いると防御が少し上がる。", type: "passive" },
      appearance: { outfitColor: "#7c4d8b", accentColor: "#ffd7a8", accessory: "tray", costumeType: "casual", weaponType: "tray", hairStyle: "neat" },
      color: "#9a65a8"
    },
    {
      id: "arcade_staff",
      name: "ゲームセンター店員",
      job: "ゲームセンター店員",
      concept: "メダルとクレーンで戦うトリッキーキャラ",
      archetype: "technical",
      speed: 4.2,
      jumpPower: 12.0,
      weight: 0.95,
      normalAttack: "メダル投げ",
      strongAttack: "クレーンアームスマッシュ",
      upAttack: "景品打ち上げ",
      downAttack: "メダル床ばらまき",
      upStrongAttack: "UFOキャッチャーアッパー",
      downStrongAttack: "筐体振動スマッシュ",
      airAttack: "メダル空中ショット",
      recoveryMove: "クレーン吊り上げ",
      skill: "確率機モード",
      tools: ["メダル", "クレーンアーム", "景品", "ゲーム筐体"],
      specialAbility: { name: "確率変動", description: "低確率で遠距離攻撃の吹っ飛ばしが少し上がる。", type: "passive" },
      appearance: { outfitColor: "#263238", accentColor: "#ffca3a", accessory: "cap", costumeType: "casual", weaponType: "coin", hairStyle: "cap" },
      color: "#f5a400"
    },
    {
      id: "librarian",
      name: "静寂の図書館司書",
      job: "司書",
      concept: "本と静寂で相手のテンポを崩す遠距離キャラ",
      archetype: "ranged",
      speed: 3.8,
      jumpPower: 11.5,
      weight: 0.95,
      normalAttack: "本投げ",
      strongAttack: "辞書スマッシュ",
      upAttack: "本棚上げ",
      downAttack: "返却箱スライド",
      upStrongAttack: "百科事典アッパー",
      downStrongAttack: "静かにスマッシュ",
      airAttack: "ページ散らし",
      recoveryMove: "しおり復帰",
      skill: "館内静粛",
      tools: ["本", "辞書", "しおり", "返却箱"],
      specialAbility: { name: "静寂フィールド", description: "近くの敵の攻撃クールダウンをわずかに長くする。", type: "passive" },
      appearance: { outfitColor: "#395144", accentColor: "#d6c7a1", accessory: "glasses", costumeType: "casual", weaponType: "book", hairStyle: "neat" },
      color: "#4d6b57"
    },
    {
      id: "childcare_worker",
      name: "全力保育士",
      job: "保育士",
      concept: "おもちゃと笛で動き回るサポート寄りキャラ",
      archetype: "support",
      speed: 4.5,
      jumpPower: 12.3,
      weight: 0.9,
      normalAttack: "おもちゃ投げ",
      strongAttack: "連絡帳スマッシュ",
      upAttack: "笛アッパー",
      downAttack: "積み木ばらまき",
      upStrongAttack: "お昼寝布団アッパー",
      downStrongAttack: "お片付けスマッシュ",
      airAttack: "紙飛行機キック",
      recoveryMove: "遊具ジャンプ",
      skill: "お昼寝タイム",
      tools: ["おもちゃ", "笛", "連絡帳", "積み木"],
      specialAbility: { name: "見守り力", description: "ダメージが高いとき、二段ジャンプ後の空中制御が少し上がる。", type: "passive" },
      appearance: { outfitColor: "#ff8fab", accentColor: "#75dddd", accessory: "whistle", costumeType: "casual", weaponType: "toy", hairStyle: "bob" },
      color: "#ff8fab"
    },
    {
      id: "photographer",
      name: "瞬間のカメラマン",
      job: "カメラマン",
      concept: "フラッシュと三脚で戦う中距離キャラ",
      archetype: "midrange",
      speed: 4.1,
      jumpPower: 11.8,
      weight: 0.95,
      normalAttack: "レンズショット",
      strongAttack: "三脚スマッシュ",
      upAttack: "フラッシュ上照射",
      downAttack: "フィルムばらまき",
      upStrongAttack: "決定的瞬間アッパー",
      downStrongAttack: "三脚固定スマッシュ",
      airAttack: "空中シャッター",
      recoveryMove: "ドローン撮影復帰",
      skill: "フラッシュバースト",
      tools: ["カメラ", "三脚", "レンズ", "フラッシュ"],
      specialAbility: { name: "決定的瞬間", description: "相手が攻撃中のときに当てると、少し吹っ飛ばしが上がる。", type: "passive" },
      appearance: { outfitColor: "#2f2f2f", accentColor: "#fefae0", accessory: "camera", costumeType: "casual", weaponType: "camera", hairStyle: "short" },
      color: "#444444"
    },
    {
      id: "patissier",
      name: "甘党パティシエ",
      job: "パティシエ",
      concept: "クリームと泡立て器で戦う設置寄りキャラ",
      archetype: "technical",
      speed: 4.0,
      jumpPower: 11.7,
      weight: 0.95,
      normalAttack: "泡立て器スピン",
      strongAttack: "ケーキ箱スマッシュ",
      upAttack: "クリーム上げ",
      downAttack: "砂糖まき",
      upStrongAttack: "ホイップアッパー",
      downStrongAttack: "ケーキ入刀スマッシュ",
      airAttack: "マカロン投げ",
      recoveryMove: "ホイップジャンプ",
      skill: "甘すぎトラップ",
      tools: ["泡立て器", "ケーキ箱", "クリーム", "マカロン"],
      specialAbility: { name: "糖分補給", description: "スキル使用後、短時間だけ移動速度が少し上がる。", type: "passive" },
      appearance: { outfitColor: "#fff1f8", accentColor: "#f77eb9", accessory: "chef_hat", costumeType: "chef", weaponType: "whisk", hairStyle: "covered" },
      color: "#f77eb9"
    },
    {
      id: "pet_groomer",
      name: "ふわふわトリマー",
      job: "ペットトリマー",
      concept: "ブラシとドライヤーで空中戦が得意",
      archetype: "mobility",
      speed: 4.6,
      jumpPower: 12.6,
      weight: 0.9,
      normalAttack: "ブラシスイング",
      strongAttack: "ドライヤーブロー",
      upAttack: "ふわ毛アッパー",
      downAttack: "爪切りスイープ",
      upStrongAttack: "シャンプー泡アッパー",
      downStrongAttack: "トリミングスマッシュ",
      airAttack: "毛玉空中アタック",
      recoveryMove: "ドライヤー浮上",
      skill: "ふわふわバリア",
      tools: ["ブラシ", "ドライヤー", "爪切り", "シャンプー"],
      specialAbility: { name: "ふわふわ軽減", description: "空中で受ける吹っ飛びを少しだけ軽減する。", type: "passive" },
      appearance: { outfitColor: "#8ecae6", accentColor: "#ffffff", accessory: "towel", costumeType: "casual", weaponType: "brush", hairStyle: "messy" },
      color: "#8ecae6"
    },
    {
      id: "bus_driver",
      name: "安全運転バス運転士",
      job: "バス運転士",
      concept: "ハンドルと車内アナウンスで押し出す重量キャラ",
      archetype: "heavy",
      speed: 3.5,
      jumpPower: 10.8,
      weight: 1.22,
      normalAttack: "ハンドルパンチ",
      strongAttack: "バス停スマッシュ",
      upAttack: "つり革上げ",
      downAttack: "整理券ばらまき",
      upStrongAttack: "急停車アッパー",
      downStrongAttack: "発車オーライスマッシュ",
      airAttack: "空中ハンドル回転",
      recoveryMove: "最終便復帰",
      skill: "急停車ブレーキ",
      tools: ["ハンドル", "バス停", "整理券", "つり革"],
      specialAbility: { name: "安全運転", description: "地上での横吹っ飛びを少し軽減する。", type: "passive" },
      appearance: { outfitColor: "#2d6a4f", accentColor: "#ffdd44", accessory: "cap", costumeType: "suit", weaponType: "wheel", hairStyle: "cap" },
      color: "#2d6a4f"
    },
    {
      id: "weather_forecaster",
      name: "気まぐれ天気予報士",
      job: "気象予報士",
      concept: "風・雨・雷を使う遠距離特殊キャラ",
      archetype: "ranged",
      speed: 4.0,
      jumpPower: 11.9,
      weight: 0.92,
      normalAttack: "雲マーク投げ",
      strongAttack: "雷注意報スマッシュ",
      upAttack: "上昇気流",
      downAttack: "雨雲設置",
      upStrongAttack: "竜巻アッパー",
      downStrongAttack: "低気圧スマッシュ",
      airAttack: "天気図ショット",
      recoveryMove: "上昇気流復帰",
      skill: "ゲリラ豪雨",
      tools: ["天気図", "傘", "雲マーク", "雷マーク"],
      specialAbility: { name: "風読み", description: "空中制御が少し高い。", type: "passive" },
      appearance: { outfitColor: "#5aa9e6", accentColor: "#ffd166", accessory: "cloud_badge", costumeType: "suit", weaponType: "umbrella", hairStyle: "neat" },
      color: "#5aa9e6"
    },
    {
      id: "shrine_priest",
      name: "お祓い神主",
      job: "神主",
      concept: "お祓い棒とお札で戦う中距離キャラ",
      archetype: "midrange",
      speed: 3.9,
      jumpPower: 11.5,
      weight: 1.0,
      normalAttack: "お札投げ",
      strongAttack: "お祓い棒スマッシュ",
      upAttack: "鈴上げ",
      downAttack: "結界札設置",
      upStrongAttack: "祈祷アッパー",
      downStrongAttack: "鳥居スマッシュ",
      airAttack: "紙垂スピン",
      recoveryMove: "神風復帰",
      skill: "厄払い結界",
      tools: ["お祓い棒", "お札", "鈴", "鳥居マーク"],
      specialAbility: { name: "厄除け", description: "低確率で状態異常を無効化する。", type: "passive" },
      appearance: { outfitColor: "#ffffff", accentColor: "#c1121f", accessory: "talisman", costumeType: "casual", weaponType: "wand", hairStyle: "neat" },
      color: "#c1121f"
    },
    {
      id: "fortune_teller",
      name: "未来視の占い師",
      job: "占い師",
      concept: "カードと水晶玉でランダム性を操るテクニカルキャラ",
      archetype: "technical",
      speed: 3.9,
      jumpPower: 11.6,
      weight: 0.92,
      normalAttack: "タロット投げ",
      strongAttack: "水晶玉スマッシュ",
      upAttack: "星読みアッパー",
      downAttack: "カードばらまき",
      upStrongAttack: "運命アッパー",
      downStrongAttack: "凶運スマッシュ",
      airAttack: "星座ショット",
      recoveryMove: "未来視ワープ",
      skill: "運命操作",
      tools: ["タロットカード", "水晶玉", "星座表", "占い布"],
      specialAbility: { name: "未来予知", description: "一定間隔で次に受ける攻撃の吹っ飛びを少し軽減する準備状態になる。", type: "passive" },
      appearance: { outfitColor: "#5a189a", accentColor: "#ffd166", accessory: "crystal", costumeType: "casual", weaponType: "card", hairStyle: "stylish" },
      color: "#7b2cbf"
    },
    {
      id: "robot_mechanic",
      name: "警備ロボ整備士",
      job: "ロボット整備士",
      concept: "工具と小型ロボで戦う設置型キャラ",
      archetype: "technical",
      speed: 3.8,
      jumpPower: 11.2,
      weight: 1.05,
      normalAttack: "ドライバー突き",
      strongAttack: "スパナスマッシュ",
      upAttack: "ロボアーム上げ",
      downAttack: "小型ロボ設置",
      upStrongAttack: "修理アームアッパー",
      downStrongAttack: "工具箱スマッシュ",
      airAttack: "ネジ投げ",
      recoveryMove: "ロボアーム復帰",
      skill: "警備ロボ起動",
      tools: ["ドライバー", "スパナ", "工具箱", "小型ロボ"],
      specialAbility: { name: "自動修理", description: "設置物の持続時間が少し長くなる。", type: "passive" },
      appearance: { outfitColor: "#5c677d", accentColor: "#80ffdb", accessory: "goggles", costumeType: "construction", weaponType: "wrench", hairStyle: "covered" },
      color: "#5c677d"
    },
    {
      id: "wedding_planner",
      name: "段取りのウェディングプランナー",
      job: "ウェディングプランナー",
      concept: "ブーケと招待状で華やかに戦う中距離キャラ",
      archetype: "support",
      speed: 4.2,
      jumpPower: 12.0,
      weight: 0.95,
      normalAttack: "招待状投げ",
      strongAttack: "ブーケスマッシュ",
      upAttack: "ベル上げ",
      downAttack: "赤絨毯スライド",
      upStrongAttack: "ケーキ入刀アッパー",
      downStrongAttack: "誓いのスマッシュ",
      airAttack: "花びらショット",
      recoveryMove: "バージンロード復帰",
      skill: "祝福フィールド",
      tools: ["ブーケ", "招待状", "ベル", "花びら"],
      specialAbility: { name: "段取り完璧", description: "試合開始から一定時間、スキルクールダウンが少し短い。", type: "passive" },
      appearance: { outfitColor: "#f8edeb", accentColor: "#ff8fab", accessory: "flower", costumeType: "suit", weaponType: "bouquet", hairStyle: "neat" },
      color: "#ff8fab"
    },
    {
      id: "mover",
      name: "怪力引越しスタッフ",
      job: "引越しスタッフ",
      concept: "段ボールと家具で豪快に戦う重量キャラ",
      archetype: "heavy",
      speed: 3.6,
      jumpPower: 10.9,
      weight: 1.25,
      normalAttack: "段ボールパンチ",
      strongAttack: "家具スマッシュ",
      upAttack: "荷物持ち上げ",
      downAttack: "台車押し",
      upStrongAttack: "冷蔵庫アッパー",
      downStrongAttack: "養生マットスマッシュ",
      airAttack: "段ボール落とし",
      recoveryMove: "エレベーター復帰",
      skill: "大型荷物搬入",
      tools: ["段ボール", "台車", "家具", "養生マット"],
      specialAbility: { name: "腰で持つ", description: "重攻撃使用後の硬直が少し短い。", type: "passive" },
      appearance: { outfitColor: "#ef7b45", accentColor: "#2f4858", accessory: "delivery_bag", costumeType: "delivery", weaponType: "box", hairStyle: "cap" },
      color: "#ef7b45"
    },
    {
      id: "receptionist",
      name: "笑顔の受付スタッフ",
      job: "受付",
      concept: "ベルと案内板で相手をさばく防御寄りキャラ",
      archetype: "defense",
      speed: 4.0,
      jumpPower: 11.6,
      weight: 0.98,
      normalAttack: "受付ベル",
      strongAttack: "案内板スマッシュ",
      upAttack: "番号札上げ",
      downAttack: "パンフレット散布",
      upStrongAttack: "呼び出しアッパー",
      downStrongAttack: "受付カウンタースマッシュ",
      airAttack: "名札スピン",
      recoveryMove: "順番待ち復帰",
      skill: "番号札バリア",
      tools: ["受付ベル", "案内板", "番号札", "パンフレット"],
      specialAbility: { name: "丁寧対応", description: "被弾直後、次の回避移動が少し速くなる。", type: "passive" },
      appearance: { outfitColor: "#4361ee", accentColor: "#f8f9fa", accessory: "badge", costumeType: "suit", weaponType: "bell", hairStyle: "neat" },
      color: "#4361ee"
    },
    {
      id: "theme_park_staff",
      name: "全力テーマパークスタッフ",
      job: "テーマパークスタッフ",
      concept: "風船とチケットで明るく戦う機動キャラ",
      archetype: "mobility",
      speed: 4.8,
      jumpPower: 12.8,
      weight: 0.88,
      normalAttack: "チケットカッター",
      strongAttack: "風船スマッシュ",
      upAttack: "パレード上げ",
      downAttack: "行列整理スライド",
      upStrongAttack: "アトラクションアッパー",
      downStrongAttack: "開園ダッシュスマッシュ",
      airAttack: "風船空中キック",
      recoveryMove: "風船浮上",
      skill: "夢の国テンション",
      tools: ["風船", "チケット", "誘導ライト", "パンフレット"],
      specialAbility: { name: "笑顔キープ", description: "高ダメージ時でも移動速度低下を受けにくい。", type: "passive" },
      appearance: { outfitColor: "#ffbe0b", accentColor: "#fb5607", accessory: "balloon", costumeType: "casual", weaponType: "ticket", hairStyle: "cap" },
      color: "#fb5607"
    },
    {
      id: "pharmacist",
      name: "調剤の薬剤師",
      job: "薬剤師",
      concept: "薬袋とカプセルで戦う遠距離サポートキャラ",
      archetype: "support",
      speed: 3.9,
      jumpPower: 11.4,
      weight: 0.95,
      normalAttack: "薬袋投げ",
      strongAttack: "調剤トレイスマッシュ",
      upAttack: "カプセル上投げ",
      downAttack: "粉薬散布",
      upStrongAttack: "処方箋アッパー",
      downStrongAttack: "服薬指導スマッシュ",
      airAttack: "カプセルショット",
      recoveryMove: "調剤棚復帰",
      skill: "処方バフ",
      tools: ["薬袋", "カプセル", "処方箋", "調剤トレイ"],
      specialAbility: { name: "副作用チェック", description: "状態異常の時間が少し短くなる。", type: "passive" },
      appearance: { outfitColor: "#ffffff", accentColor: "#06d6a0", accessory: "glasses", costumeType: "doctor", weaponType: "capsule", hairStyle: "short" },
      color: "#06d6a0"
    },
    {
      id: "fisherman",
      name: "荒波の漁師",
      job: "漁師",
      concept: "釣り竿と網で相手を引き寄せる中距離キャラ",
      archetype: "midrange",
      speed: 3.8,
      jumpPower: 11.2,
      weight: 1.15,
      normalAttack: "釣り針スイング",
      strongAttack: "大漁網スマッシュ",
      upAttack: "竿しなり上げ",
      downAttack: "網足払い",
      upStrongAttack: "一本釣りアッパー",
      downStrongAttack: "大波スマッシュ",
      airAttack: "魚投げ",
      recoveryMove: "釣り竿復帰",
      skill: "大漁引き寄せ",
      tools: ["釣り竿", "網", "魚", "浮き"],
      specialAbility: { name: "潮読み", description: "ステージ端付近で復帰技の横移動が少し伸びる。", type: "passive" },
      appearance: { outfitColor: "#0077b6", accentColor: "#90e0ef", accessory: "cap", costumeType: "casual", weaponType: "rod", hairStyle: "cap" },
      color: "#0077b6"
    },
    {
      id: "postal_worker",
      name: "速達の郵便局員",
      job: "郵便局員",
      concept: "手紙とポストで戦う遠距離寄りキャラ",
      archetype: "ranged",
      speed: 4.4,
      jumpPower: 12.1,
      weight: 0.95,
      normalAttack: "封筒投げ",
      strongAttack: "ポストスマッシュ",
      upAttack: "速達上投げ",
      downAttack: "不在票設置",
      upStrongAttack: "集配アッパー",
      downStrongAttack: "消印スマッシュ",
      airAttack: "はがきショット",
      recoveryMove: "配達バイク復帰",
      skill: "速達モード",
      tools: ["封筒", "はがき", "ポスト", "不在票"],
      specialAbility: { name: "速達保証", description: "一定時間ごとに次の遠距離攻撃が少し速くなる。", type: "passive" },
      appearance: { outfitColor: "#d62828", accentColor: "#ffffff", accessory: "delivery_bag", costumeType: "delivery", weaponType: "letter", hairStyle: "cap" },
      color: "#d62828"
    },
    {
      id: "airport_ground_staff",
      name: "空港グランドスタッフ",
      job: "空港スタッフ",
      concept: "誘導灯とスーツケースで空中戦を支えるキャラ",
      archetype: "mobility",
      speed: 4.2,
      jumpPower: 12.4,
      weight: 0.95,
      normalAttack: "誘導灯スイング",
      strongAttack: "スーツケーススマッシュ",
      upAttack: "離陸アッパー",
      downAttack: "手荷物スライド",
      upStrongAttack: "搭乗ゲートアッパー",
      downStrongAttack: "預け荷物スマッシュ",
      airAttack: "航空券ショット",
      recoveryMove: "離陸復帰",
      skill: "搭乗開始アナウンス",
      tools: ["誘導灯", "スーツケース", "航空券", "手荷物タグ"],
      specialAbility: { name: "離陸姿勢", description: "二段ジャンプ後の上昇力が少し高い。", type: "passive" },
      appearance: { outfitColor: "#0b3954", accentColor: "#ffb703", accessory: "badge", costumeType: "suit", weaponType: "baton", hairStyle: "neat" },
      color: "#0b3954"
    },
    {
      id: "aquarium_keeper",
      name: "水族館飼育員",
      job: "水族館スタッフ",
      concept: "バケツと魚で水しぶきを使う中距離キャラ",
      archetype: "midrange",
      speed: 4.1,
      jumpPower: 11.9,
      weight: 1.0,
      normalAttack: "魚バケツ投げ",
      strongAttack: "水槽ブラシスマッシュ",
      upAttack: "水しぶき上げ",
      downAttack: "ぬれ床スライド",
      upStrongAttack: "イルカジャンプアッパー",
      downStrongAttack: "水槽清掃スマッシュ",
      airAttack: "魚影ショット",
      recoveryMove: "水流復帰",
      skill: "大水槽ウェーブ",
      tools: ["バケツ", "魚", "水槽ブラシ", "水しぶき"],
      specialAbility: { name: "水慣れ", description: "滑る床や水系ギミックの影響を受けにくい。", type: "passive" },
      appearance: { outfitColor: "#00afb9", accentColor: "#caf0f8", accessory: "bucket", costumeType: "casual", weaponType: "bucket", hairStyle: "cap" },
      color: "#00afb9"
    },
    {
      id: "cinema_staff",
      name: "映画館スタッフ",
      job: "映画館スタッフ",
      concept: "ポップコーンとライトで戦う遠距離キャラ",
      archetype: "ranged",
      speed: 4.0,
      jumpPower: 11.7,
      weight: 0.95,
      normalAttack: "ポップコーンショット",
      strongAttack: "上映ライトスマッシュ",
      upAttack: "チケット上投げ",
      downAttack: "こぼれポップコーン",
      upStrongAttack: "スクリーンアッパー",
      downStrongAttack: "満席スマッシュ",
      airAttack: "フィルム投げ",
      recoveryMove: "エンドロール復帰",
      skill: "上映開始",
      tools: ["ポップコーン", "チケット", "上映ライト", "フィルム"],
      specialAbility: { name: "クライマックス補正", description: "残機が1のとき、重攻撃の吹っ飛ばしが少し上がる。", type: "passive" },
      appearance: { outfitColor: "#111827", accentColor: "#f5c542", accessory: "ticket", costumeType: "casual", weaponType: "popcorn", hairStyle: "short" },
      color: "#111827"
    },
    {
      id: "gym_trainer",
      name: "熱血ジムトレーナー",
      job: "スポーツトレーナー",
      concept: "ダンベルとプロテインで戦う近距離パワーキャラ",
      archetype: "melee",
      speed: 4.1,
      jumpPower: 11.8,
      weight: 1.12,
      normalAttack: "ダンベルジャブ",
      strongAttack: "バーベルスマッシュ",
      upAttack: "スクワットアッパー",
      downAttack: "レッグプレス",
      upStrongAttack: "ベンチプレスアッパー",
      downStrongAttack: "プロテインシェイクスマッシュ",
      airAttack: "空中ニーアップ",
      recoveryMove: "懸垂復帰",
      skill: "筋トレ追い込み",
      tools: ["ダンベル", "バーベル", "プロテイン", "トレーニングマット"],
      specialAbility: { name: "パンプアップ", description: "近距離攻撃を連続で当てると、次の重攻撃が少し強くなる。", type: "passive" },
      appearance: { outfitColor: "#ef233c", accentColor: "#2b2d42", accessory: "headband", costumeType: "casual", weaponType: "dumbbell", hairStyle: "spiky" },
      color: "#ef233c"
    },
    {
      id: "stage_actor",
      name: "大げさな舞台俳優",
      job: "舞台俳優",
      concept: "台詞と小道具で派手に戦うテクニカルキャラ",
      archetype: "technical",
      speed: 4.2,
      jumpPower: 12.2,
      weight: 0.95,
      normalAttack: "台本投げ",
      strongAttack: "スポットライトスマッシュ",
      upAttack: "大見得アッパー",
      downAttack: "舞台袖スライド",
      upStrongAttack: "主役アッパー",
      downStrongAttack: "カーテンコールスマッシュ",
      airAttack: "空中台詞斬り",
      recoveryMove: "ワイヤー復帰",
      skill: "主役補正",
      tools: ["台本", "スポットライト", "仮面", "マント"],
      specialAbility: { name: "観客の視線", description: "連続で攻撃を当てると一時的に攻撃演出が派手になり、吹っ飛ばしが少し上がる。", type: "passive" },
      appearance: { outfitColor: "#6d214f", accentColor: "#f8c471", accessory: "mask", costumeType: "casual", weaponType: "script", hairStyle: "stylish" },
      color: "#6d214f"
    },
    {
      id: "yakitori_cook",
      name: "炭火の焼き鳥職人",
      job: "焼き鳥職人",
      concept: "串と炭火で近距離火力を出すキャラ",
      archetype: "melee",
      speed: 3.9,
      jumpPower: 11.4,
      weight: 1.08,
      normalAttack: "串突き",
      strongAttack: "炭火スマッシュ",
      upAttack: "串上げ",
      downAttack: "タレこぼし",
      upStrongAttack: "焼き台アッパー",
      downStrongAttack: "炭火たたきつけ",
      airAttack: "空中串回転",
      recoveryMove: "煙上昇復帰",
      skill: "炭火全開",
      tools: ["焼き鳥串", "炭火", "うちわ", "タレ壺"],
      specialAbility: { name: "焼き加減", description: "同じ相手に連続ヒットすると、次の近距離攻撃のダメージが少し上がる。", type: "passive" },
      appearance: { outfitColor: "#3c2f2f", accentColor: "#ff7b00", accessory: "headband", costumeType: "chef", weaponType: "skewer", hairStyle: "covered" },
      color: "#8d5524"
    },
    {
      id: "detective",
      name: "張り込み探偵",
      job: "探偵",
      concept: "虫眼鏡と推理で相手の隙を突く中距離テクニカルキャラ",
      archetype: "technical",
      speed: 4.1,
      jumpPower: 11.8,
      weight: 0.95,
      normalAttack: "虫眼鏡スイング",
      strongAttack: "証拠品スマッシュ",
      upAttack: "推理アッパー",
      downAttack: "張り込みトラップ",
      upStrongAttack: "真相アッパー",
      downStrongAttack: "犯人確保スマッシュ",
      airAttack: "メモ帳投げ",
      recoveryMove: "ロープ張り込み復帰",
      skill: "真相解明",
      tools: ["虫眼鏡", "メモ帳", "証拠品", "トレンチコート"],
      specialAbility: { name: "観察眼", description: "相手が攻撃を外した直後に攻撃を当てると、吹っ飛ばしが少し上がる。", type: "passive" },
      appearance: { outfitColor: "#6b4f3a", accentColor: "#d9c2a3", accessory: "glasses", costumeType: "suit", weaponType: "magnifier", hairStyle: "neat" },
      color: "#6b4f3a"
    }
  );

  const defaultAppearance = {
    skinColor: "#f4c79f",
    hairColor: "#3a2a1a",
    outfitColor: "#4f7cac",
    accentColor: "#ffffff",
    accessory: "document",
    costumeType: "casual",
    weaponType: "paper",
    hairStyle: "short"
  };

  const appearanceById = {
    salaryman: {
      skinColor: "#f0c39a",
      hairColor: "#2f241f",
      outfitColor: "#34445f",
      accentColor: "#e63946",
      accessory: "documents",
      costumeType: "suit",
      weaponType: "card",
      hairStyle: "neat"
    },
    programmer: {
      skinColor: "#edc8a0",
      hairColor: "#25212f",
      outfitColor: "#2d253f",
      accentColor: "#8d7bff",
      accessory: "headphones",
      costumeType: "hoodie",
      weaponType: "keyboard",
      hairStyle: "messy"
    },
    chef: {
      skinColor: "#f3c19a",
      hairColor: "#3b2a1f",
      outfitColor: "#f8f9fa",
      accentColor: "#e4572e",
      accessory: "chef_hat",
      costumeType: "chef",
      weaponType: "pan",
      hairStyle: "covered"
    },
    doctor: {
      skinColor: "#f1c7a2",
      hairColor: "#2e2b28",
      outfitColor: "#ffffff",
      accentColor: "#58b4ae",
      accessory: "stethoscope",
      costumeType: "doctor",
      weaponType: "stethoscope",
      hairStyle: "short"
    },
    nurse: {
      skinColor: "#f4c7a1",
      hairColor: "#46312a",
      outfitColor: "#f7e8f0",
      accentColor: "#f28ab2",
      accessory: "nurse_cap",
      costumeType: "nurse",
      weaponType: "bandage",
      hairStyle: "bob"
    },
    lawyer: {
      skinColor: "#f0c39a",
      hairColor: "#2b241e",
      outfitColor: "#202638",
      accentColor: "#ffd166",
      accessory: "badge",
      costumeType: "lawyer",
      weaponType: "evidence",
      hairStyle: "neat"
    },
    teacher: {
      skinColor: "#f2c39c",
      hairColor: "#3b2c22",
      outfitColor: "#4f6f52",
      accentColor: "#ffffff",
      accessory: "glasses",
      costumeType: "teacher",
      weaponType: "chalk",
      hairStyle: "short"
    },
    firefighter: {
      skinColor: "#efbd96",
      hairColor: "#382818",
      outfitColor: "#b3261e",
      accentColor: "#ffe66d",
      accessory: "helmet",
      costumeType: "firefighter",
      weaponType: "hose",
      hairStyle: "covered"
    },
    police: {
      skinColor: "#f1c49b",
      hairColor: "#2b2b2b",
      outfitColor: "#1d4e89",
      accentColor: "#ffffff",
      accessory: "police_cap",
      costumeType: "police",
      weaponType: "baton",
      hairStyle: "short"
    },
    construction: {
      skinColor: "#efbd91",
      hairColor: "#31251c",
      outfitColor: "#4f5d75",
      accentColor: "#ffca3a",
      accessory: "helmet",
      costumeType: "construction",
      weaponType: "hammer",
      hairStyle: "covered"
    },
    delivery: {
      skinColor: "#f2c59e",
      hairColor: "#2f251c",
      outfitColor: "#ffb703",
      accentColor: "#2d6cdf",
      accessory: "delivery_bag",
      costumeType: "delivery",
      weaponType: "box",
      hairStyle: "cap"
    },
    barista: {
      skinColor: "#efc19a",
      hairColor: "#3a2419",
      outfitColor: "#5d4037",
      accentColor: "#f7e1bc",
      accessory: "coffee",
      costumeType: "barista",
      weaponType: "cup",
      hairStyle: "cap"
    },
    hairdresser: {
      skinColor: "#f3c09b",
      hairColor: "#7d3cff",
      outfitColor: "#212121",
      accentColor: "#ff7eb6",
      accessory: "towel",
      costumeType: "hairdresser",
      weaponType: "scissors",
      hairStyle: "stylish"
    },
    farmer: {
      skinColor: "#eeb98d",
      hairColor: "#59402c",
      outfitColor: "#6a994e",
      accentColor: "#f4d35e",
      accessory: "straw_hat",
      costumeType: "farmer",
      weaponType: "carrot",
      hairStyle: "covered"
    },
    researcher: {
      skinColor: "#f1c19a",
      hairColor: "#4b382d",
      outfitColor: "#f8f9fa",
      accentColor: "#43aa8b",
      accessory: "goggles",
      costumeType: "researcher",
      weaponType: "flask",
      hairStyle: "messy"
    },
    security: {
      skinColor: "#f1c39a",
      hairColor: "#2f2b26",
      outfitColor: "#606c38",
      accentColor: "#f7ff6b",
      accessory: "security_cap",
      costumeType: "security",
      weaponType: "flashlight",
      hairStyle: "cap"
    },
    cleaner: {
      skinColor: "#efc09a",
      hairColor: "#2d2d2d",
      outfitColor: "#00afb9",
      accentColor: "#ffffff",
      accessory: "cap",
      costumeType: "cleaner",
      weaponType: "mop",
      hairStyle: "cap"
    },
    realtor: {
      skinColor: "#f0c49b",
      hairColor: "#3b2d24",
      outfitColor: "#375a7f",
      accentColor: "#f77f00",
      accessory: "house_badge",
      costumeType: "realtor",
      weaponType: "key",
      hairStyle: "neat"
    },
    streamer: {
      skinColor: "#f2bf98",
      hairColor: "#ef476f",
      outfitColor: "#3a0ca3",
      accentColor: "#ffd166",
      accessory: "headset",
      costumeType: "streamer",
      weaponType: "mic",
      hairStyle: "spiky"
    },
    accountant: {
      skinColor: "#f0c19a",
      hairColor: "#2c241d",
      outfitColor: "#293241",
      accentColor: "#118ab2",
      accessory: "glasses",
      costumeType: "accountant",
      weaponType: "calculator",
      hairStyle: "neat"
    },
    happy_repeat_student: {
      skinColor: "#f4c79f",
      hairColor: "#3a2a1a",
      outfitColor: "#ffcc33",
      accentColor: "#3399ff",
      accessory: "cigarette",
      secondaryAccessory: "backpack",
      costumeType: "education_student",
      weaponType: "lesson_plan",
      hairStyle: "messy"
    }
  };

  for (const character of characters) {
    const configuredAppearance = {
      ...defaultAppearance,
      ...(character.appearance ?? {}),
      ...(appearanceById[character.id] ?? {})
    };
    character.appearance = {
      ...configuredAppearance,
      outfitColor: configuredAppearance.outfitColor ?? character.color
    };
    character.color = character.color ?? character.appearance.outfitColor;
  }

  const combatProfileById = {
    salaryman: {
      archetype: "midrange",
      tools: ["名刺", "稟議書", "会議資料"],
      upAttack: "議事録アッパー",
      downAttack: "名刺足払い",
      upStrongAttack: "会議資料打ち上げ",
      downStrongAttack: "稟議書たたきつけ"
    },
    programmer: {
      archetype: "ranged",
      tools: ["キーボード", "バグ", "コード"],
      upAttack: "コード補完上げ",
      downAttack: "バグ床置き",
      upStrongAttack: "徹夜デプロイ上げ",
      downStrongAttack: "クラッシュログ落とし"
    },
    chef: {
      archetype: "melee",
      tools: ["おたま", "フライパン", "激辛スープ"],
      upAttack: "おたま打ち上げ",
      downAttack: "フライパン足元払い",
      upStrongAttack: "鍋ふたアッパー",
      downStrongAttack: "まな板たたきつけ"
    },
    doctor: {
      archetype: "technical",
      tools: ["聴診器", "カルテ", "応急セット"],
      upAttack: "聴診器リフト",
      downAttack: "カルテ足元診断",
      upStrongAttack: "診察台アッパー",
      downStrongAttack: "カルテバインダー落とし"
    },
    nurse: {
      archetype: "melee",
      tools: ["包帯", "ナースコール", "バリア"],
      upAttack: "包帯巻き上げ",
      downAttack: "包帯足払い",
      upStrongAttack: "ナースコール上昇波",
      downStrongAttack: "救急バッグプレス"
    },
    lawyer: {
      archetype: "midrange",
      tools: ["書類", "証拠品", "六法全書"],
      upAttack: "異議ありアッパー",
      downAttack: "証拠品足元提出",
      upStrongAttack: "判例打ち上げ",
      downStrongAttack: "六法全書スタンプ"
    },
    teacher: {
      archetype: "ranged",
      tools: ["チョーク", "黒板消し", "小テスト"],
      upAttack: "チョーク上投げ",
      downAttack: "黒板消し落とし",
      upStrongAttack: "教卓アッパー",
      downStrongAttack: "小テストばらまき"
    },
    firefighter: {
      archetype: "melee",
      tools: ["ホース", "消火器", "ヘルメット"],
      upAttack: "放水アッパー",
      downAttack: "ホース足元払い",
      upStrongAttack: "消火器噴射上げ",
      downStrongAttack: "安全確認プレス"
    },
    police: {
      archetype: "midrange",
      tools: ["警棒", "停止標識", "交通笛"],
      upAttack: "警棒打ち上げ",
      downAttack: "停止線足払い",
      upStrongAttack: "交通整理アッパー",
      downStrongAttack: "停止命令ショック"
    },
    construction: {
      archetype: "melee",
      tools: ["レンチ", "ハンマー", "仮設足場"],
      upAttack: "レンチ打ち上げ",
      downAttack: "安全靴踏み込み",
      upStrongAttack: "鉄骨アッパー",
      downStrongAttack: "安全第一ハンマー落とし"
    },
    delivery: {
      archetype: "melee",
      tools: ["段ボール", "台車", "配達バッグ"],
      upAttack: "段ボール上投げ",
      downAttack: "台車足元すべり",
      upStrongAttack: "速達アッパー",
      downStrongAttack: "置き配プレス"
    },
    barista: {
      archetype: "ranged",
      tools: ["コーヒー豆", "ラテ", "カップ"],
      upAttack: "豆ショット上げ",
      downAttack: "コーヒー床こぼし",
      upStrongAttack: "ラテアート噴き上げ",
      downStrongAttack: "熱々ラテ落とし"
    },
    hairdresser: {
      archetype: "melee",
      tools: ["ハサミ", "ドライヤー", "タオル"],
      upAttack: "ハサミリフト",
      downAttack: "毛先カット足払い",
      upStrongAttack: "ドライヤー上昇風",
      downStrongAttack: "シャンプープレス"
    },
    farmer: {
      archetype: "technical",
      tools: ["にんじん", "くわ", "野菜トラップ"],
      upAttack: "にんじん上投げ",
      downAttack: "くわ足元掘り",
      upStrongAttack: "豊作アッパー",
      downStrongAttack: "畑ならしスマッシュ"
    },
    researcher: {
      archetype: "ranged",
      tools: ["試験管", "フラスコ", "実験薬"],
      upAttack: "試験管上投げ",
      downAttack: "薬品床反応",
      upStrongAttack: "フラスコ噴き上げ",
      downStrongAttack: "実験台爆発"
    },
    security: {
      archetype: "technical",
      tools: ["懐中電灯", "ゲート", "巡回記録"],
      upAttack: "ライト照射上げ",
      downAttack: "ゲート足元閉鎖",
      upStrongAttack: "巡回棒アッパー",
      downStrongAttack: "警備ゲートプレス"
    },
    cleaner: {
      archetype: "technical",
      tools: ["モップ", "掃除機", "ワックス"],
      upAttack: "モップはね上げ",
      downAttack: "床みがき足払い",
      upStrongAttack: "掃除機上昇吸引",
      downStrongAttack: "ワックス床ドン"
    },
    realtor: {
      archetype: "technical",
      tools: ["鍵", "契約書", "物件資料"],
      upAttack: "鍵束アッパー",
      downAttack: "物件資料足元撒き",
      upStrongAttack: "内見案内上げ",
      downStrongAttack: "契約書スタンプ"
    },
    streamer: {
      archetype: "ranged",
      tools: ["マイク", "サムネ", "配信画面"],
      upAttack: "コメント上昇弾",
      downAttack: "炎上コメント落とし",
      upStrongAttack: "バズり打ち上げ",
      downStrongAttack: "サムネ詐欺落下"
    },
    accountant: {
      archetype: "midrange",
      tools: ["電卓", "領収書", "申告書"],
      upAttack: "電卓アッパー",
      downAttack: "領収書足元整理",
      upStrongAttack: "決算書打ち上げ",
      downStrongAttack: "確定申告スタンプ"
    },
    happy_repeat_student: {
      archetype: "technical",
      tools: ["指導案", "教育実習日誌", "赤ペン", "リュック", "くわえたばこ"],
      upAttack: "指導案チェック上げ",
      downAttack: "実習日誌たたきつけ",
      upStrongAttack: "反省会アッパー",
      downStrongAttack: "実習日誌確認プレス"
    }
  };

  for (const character of characters) {
    const profile = combatProfileById[character.id] ?? {};
    const archetype = profile.archetype ?? character.archetype ?? "midrange";
    Object.assign(character, {
      archetype,
      archetypeLabel: ARCHETYPE_LABELS[archetype] ?? archetype,
      tools: profile.tools ?? character.tools ?? [character.appearance.weaponType],
      upAttack: profile.upAttack ?? character.upAttack ?? `${character.normalAttack}上げ`,
      downAttack: profile.downAttack ?? character.downAttack ?? `${character.normalAttack}下段`,
      upStrongAttack: profile.upStrongAttack ?? character.upStrongAttack ?? `${character.strongAttack}上げ`,
      downStrongAttack: profile.downStrongAttack ?? character.downStrongAttack ?? `${character.strongAttack}下段`,
      airAttack: profile.airAttack ?? character.airAttack ?? `空中${character.normalAttack}`,
      recoveryMove: profile.recoveryMove ?? character.recoveryMove ?? `${character.job}復帰技`,
      specialAbility: character.specialAbility ?? { name: "職業魂", description: "職業ごとの個性を活かして戦う。", type: "passive" }
    });
  }

  const EFFECT_THEME_BY_ID = {
    salaryman: {
      normal: "business_card_slash",
      strong: "approval_stamp_impact",
      up: "meeting_paper_rise",
      down: "name_card_sweep",
      air: "document_spin",
      recovery: "train_dash_recovery",
      skill: "meeting_field_aura",
      ultimate: "final_approval_stampede"
    },
    programmer: {
      normal: "bug_pixel_throw",
      strong: "keyboard_crash_spark",
      up: "code_line_rise",
      down: "error_log_floor",
      air: "cursor_spin",
      recovery: "deploy_jump",
      skill: "debug_zone_glitch",
      ultimate: "production_deploy_crash"
    },
    chef: {
      normal: "ladle_arc",
      strong: "frying_pan_spark",
      up: "pan_flame_rise",
      down: "cutting_board_slam",
      air: "seasoning_spin",
      recovery: "steam_jump",
      skill: "spicy_soup_aura",
      ultimate: "full_course_pan_burst"
    },
    doctor: {
      normal: "stethoscope_whip",
      strong: "chart_binder_impact",
      up: "medical_cross_rise",
      down: "chart_floor_check",
      air: "bandage_air_spin",
      recovery: "emergency_lift",
      skill: "first_aid_glow",
      ultimate: "emergency_operation_burst"
    },
    nurse: {
      normal: "bandage_swing",
      strong: "nurse_call_wave",
      up: "bandage_rise",
      down: "care_bag_floor",
      air: "gauze_spin",
      recovery: "care_jump",
      skill: "bandage_guard",
      ultimate: "nurse_call_rush"
    },
    lawyer: {
      normal: "evidence_paper_wave",
      strong: "red_stamp_impact",
      up: "precedent_paper_rise",
      down: "law_book_floor",
      air: "objection_air_wave",
      recovery: "appeal_jump",
      skill: "evidence_submission",
      ultimate: "final_objection_impact"
    },
    teacher: {
      normal: "chalk_dust",
      strong: "eraser_powder_impact",
      up: "chalk_line_rise",
      down: "quiz_paper_floor",
      air: "chalk_spin",
      recovery: "lesson_jump",
      skill: "pop_quiz_field",
      ultimate: "final_exam_falcon"
    },
    firefighter: {
      normal: "hose_water_jet",
      strong: "extinguisher_smoke_burst",
      up: "water_rise",
      down: "hose_floor_sweep",
      air: "water_spin",
      recovery: "water_jet_recovery",
      skill: "firefighter_water_aura",
      ultimate: "rescue_water_burst"
    },
    happy_repeat_student: {
      normal: "lesson_plan_paper",
      strong: "training_diary_impact",
      up: "red_pen_check_up",
      down: "diary_floor_slam",
      air: "paper_spin",
      recovery: "internship_jump",
      skill: "happy_internship_aura",
      ultimate: "final_practicum_festival"
    }
  };

  const ULTIMATE_NAME_BY_ID = {
    salaryman: "最終稟議・全員承認スマッシュ",
    programmer: "本番環境デプロイクラッシュ",
    chef: "フルコース焼き上げフライパン",
    doctor: "緊急オペレーション",
    nurse: "ナースコール連打ラッシュ",
    lawyer: "最終弁論インパクト",
    teacher: "期末試験ファルコン",
    firefighter: "大放水レスキューバースト",
    police: "全面交通規制",
    construction: "超大型クレーン落とし",
    delivery: "超速お急ぎ便アタック",
    barista: "トリプルエスプレッソバースト",
    hairdresser: "ファイナルヘアカット",
    farmer: "大収穫祭トラクター",
    researcher: "大爆発実験成功",
    security: "完全巡回セキュリティ",
    cleaner: "全床ワックスフィニッシュ",
    realtor: "即決契約ワープスマッシュ",
    streamer: "全世界バズる配信",
    accountant: "年度末決算バースト",
    happy_repeat_student: "最終教育実習フェスティバル"
  };

  function inferEffectFamily(character) {
    const weapon = character.appearance?.weaponType ?? "";
    const costume = character.appearance?.costumeType ?? "";
    const id = character.id ?? "";
    const joined = `${weapon} ${costume} ${id} ${character.job}`;
    if (/lesson|paper|book|card|ticket|receipt|document|envelope|script|memo|stamp|contract|diary|clipboard|file|form|ledger|tarot|ofuda/.test(joined)) return "paper";
    if (/hose|water|fish|aquarium|rain|cloud|bubble|foam|mop/.test(joined)) return "water";
    if (/pan|wrench|hammer|baton|bell|key|calculator|dumbbell|barbell|scissors|driver|spanner|metal|mic|camera|tripod|tool/.test(joined)) return "metal";
    if (/chalk|powder|dust|cleaner|smoke|steam|flour|brush|broom|vacuum/.test(joined)) return "dust";
    if (/flask|capsule|medicine|tooth|medical|research|pharmacist|doctor|nurse|dental/.test(joined)) return "medical";
    if (/fire|chef|spice|yakitori|cake|coffee|carrot|food|barista|patissier/.test(joined)) return "food";
    if (/flashlight|light|screen|film|spotlight|arcade|streamer|cinema|forecast/.test(joined)) return "light";
    if (/flower|bouquet|shrine|fortune|star|wedding|theme_park/.test(joined)) return "sparkle";
    if (/bus|airport|delivery|mover|station|postal|driver|cart|suitcase/.test(joined)) return "vehicle";
    if (["ranged", "support", "control"].includes(character.archetype)) return "paper";
    if (["mobility", "technical"].includes(character.archetype)) return "light";
    return "impact";
  }

  function hashString(value = "") {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function originalStrongProfile(character) {
    const seed = hashString(`${character.id}:${character.strongAttack}:${character.job}`);
    const archetype = character.archetype ?? "midrange";
    const family = inferEffectFamily(character);
    const style = seed % 8;
    const reachBonus = seed % 11;
    const speedBonus = (seed >> 4) % 5;
    const isRanged = ["ranged", "control", "support"].includes(archetype);
    const isHeavy = ["heavy", "defense"].includes(archetype);
    const isQuick = ["mobility", "technical"].includes(archetype);
    const paperLike = /paper|document|book|card|ticket|receipt|lesson|diary|form|memo|script|envelope|tarot|ofuda/.test(family);
    const waterLike = /water/.test(family);
    const lightLike = /light|sparkle/.test(family);
    const metalLike = /metal|impact|vehicle/.test(family);
    const foodLike = /food|medical/.test(family);
    const theme = character.effectTheme?.strong ?? `${family}_strong_${character.id}`;

    const profile = {
      width: 74 + reachBonus,
      height: 38 + (seed % 7),
      offsetYRatio: 0.24,
      damageMultiplier: 1,
      knockbackMultiplier: 1,
      damageScaleMultiplier: 1,
      cooldown: 0.62 + speedBonus * 0.025,
      duration: 0.17 + (seed % 3) * 0.015,
      startup: 0.15 + (seed % 4) * 0.018,
      angleY: -0.24,
      attackDirection: "forward",
      selfVelocityX: 0,
      projectile: false,
      projectileVx: 0,
      projectileVy: 0,
      projectileKind: paperLike ? "paper" : "spark",
      color: effectColorForTheme(theme, character, "strongAttack")
    };

    if (isHeavy) {
      profile.width += 8;
      profile.height += 8;
      profile.damageMultiplier += 0.12;
      profile.knockbackMultiplier += 0.16;
      profile.cooldown += 0.08;
      profile.startup += 0.05;
    }
    if (isQuick) {
      profile.width -= 4;
      profile.damageMultiplier -= 0.04;
      profile.cooldown -= 0.06;
      profile.startup -= 0.035;
      profile.selfVelocityX = 1.8 + (seed % 4) * 0.35;
    }
    if (isRanged && style !== 2) {
      profile.projectile = true;
      profile.width = paperLike ? 52 + (seed % 18) : 44 + (seed % 15);
      profile.height = paperLike ? 22 + (seed % 8) : 28 + (seed % 10);
      profile.damageMultiplier = 0.9 + (seed % 5) * 0.025;
      profile.knockbackMultiplier = 0.9 + ((seed >> 5) % 5) * 0.035;
      profile.cooldown = 0.58 + (seed % 5) * 0.035;
      profile.startup = 0.1 + (seed % 4) * 0.02;
      profile.duration = 0.28;
      profile.projectileVx = 6.4 + (seed % 5) * 0.55;
      profile.projectileVy = style === 5 ? -1.1 : style === 6 ? 0.7 : 0;
    }

    if (style === 1) {
      profile.height += 18;
      profile.offsetYRatio = 0.03;
      profile.angleY = -0.52;
      profile.attackDirection = "forwardUp";
    } else if (style === 2) {
      profile.width += 14;
      profile.height = Math.max(30, profile.height - 6);
      profile.offsetYRatio = 0.52;
      profile.angleY = -0.08;
      profile.attackDirection = "forwardDown";
    } else if (style === 3) {
      profile.width += 20;
      profile.selfVelocityX += 2.4;
      profile.damageMultiplier += 0.03;
      profile.cooldown += 0.04;
    } else if (style === 4) {
      profile.width -= 7;
      profile.height += 16;
      profile.damageMultiplier += 0.09;
      profile.knockbackMultiplier += 0.1;
      profile.startup += 0.04;
    } else if (style === 5) {
      profile.width += 6;
      profile.damageScaleMultiplier += 0.08;
      profile.angleY = -0.36;
    } else if (style === 6) {
      profile.width += 4;
      profile.height += 8;
      profile.angleY = -0.68;
      profile.attackDirection = "forwardUp";
    } else if (style === 7) {
      profile.width += 18;
      profile.height += 2;
      profile.knockbackMultiplier += 0.07;
      profile.startup += 0.025;
    }

    if (waterLike) {
      profile.width += 14;
      profile.damageMultiplier -= 0.04;
      profile.damageScaleMultiplier += 0.08;
    }
    if (lightLike) {
      profile.startup -= 0.03;
      profile.cooldown -= 0.035;
      profile.selfVelocityX += 1.1;
    }
    if (metalLike) {
      profile.knockbackMultiplier += 0.08;
      profile.startup += 0.02;
    }
    if (foodLike) {
      profile.damageMultiplier += 0.05;
      profile.duration += 0.025;
    }

    profile.width = clamp(Math.round(profile.width), 46, 108);
    profile.height = clamp(Math.round(profile.height), 24, 72);
    profile.damageMultiplier = clamp(profile.damageMultiplier, 0.82, 1.28);
    profile.knockbackMultiplier = clamp(profile.knockbackMultiplier, 0.82, 1.34);
    profile.damageScaleMultiplier = clamp(profile.damageScaleMultiplier, 0.9, 1.16);
    profile.cooldown = clamp(profile.cooldown, 0.48, 0.86);
    profile.startup = clamp(profile.startup, 0.07, 0.28);
    profile.duration = clamp(profile.duration, 0.14, 0.32);
    return profile;
  }

  const ARCHETYPE_MOVE_MODS = {
    melee: { reach: 0.98, damage: 1.08, knockback: 1.06, cooldown: 1.02, startup: 1.0, duration: 1.02 },
    midrange: { reach: 1.04, damage: 1.0, knockback: 1.0, cooldown: 1.0, startup: 1.0, duration: 1.0 },
    ranged: { reach: 1.22, damage: 0.92, knockback: 0.93, cooldown: 1.07, startup: 0.96, duration: 0.96 },
    mobility: { reach: 0.94, damage: 0.93, knockback: 0.95, cooldown: 0.86, startup: 0.82, duration: 0.9 },
    technical: { reach: 1.06, damage: 0.98, knockback: 1.02, cooldown: 0.95, startup: 0.9, duration: 0.98 },
    control: { reach: 1.14, damage: 0.94, knockback: 0.98, cooldown: 1.05, startup: 0.95, duration: 1.08 },
    support: { reach: 1.1, damage: 0.9, knockback: 0.92, cooldown: 0.96, startup: 0.92, duration: 1.02 },
    heavy: { reach: 1.1, damage: 1.14, knockback: 1.2, cooldown: 1.16, startup: 1.16, duration: 1.08 },
    defense: { reach: 1.06, damage: 0.98, knockback: 1.12, cooldown: 1.08, startup: 1.08, duration: 1.12 }
  };

  const MOVE_TYPE_MODS = {
    normalAttack: { reach: 1, damage: 1, knockback: 0.96, cooldown: 0.92, startup: 0.86, duration: 0.95 },
    upAttack: { reach: 0.92, height: 1.18, damage: 0.98, knockback: 1.02, cooldown: 1, startup: 0.96, duration: 1 },
    downAttack: { reach: 1.14, height: 0.9, damage: 0.96, knockback: 0.98, cooldown: 1.02, startup: 0.98, duration: 1.08 },
    strongAttack: { reach: 1.02, damage: 1.02, knockback: 1.04, cooldown: 1.02, startup: 1.02, duration: 1.03 },
    upStrongAttack: { reach: 0.96, height: 1.12, damage: 1.03, knockback: 1.08, cooldown: 1.04, startup: 1.05, duration: 1.02 },
    downStrongAttack: { reach: 1.1, height: 0.94, damage: 1, knockback: 1.05, cooldown: 1.04, startup: 1.03, duration: 1.06 },
    airAttack: { reach: 0.98, damage: 0.94, knockback: 0.96, cooldown: 0.9, startup: 0.88, duration: 0.92 },
    airForwardAttack: { reach: 1.04, damage: 0.98, knockback: 0.98, cooldown: 0.94, startup: 0.92, duration: 0.95 },
    airBackAttack: { reach: 1.02, damage: 1.04, knockback: 1.08, cooldown: 1.02, startup: 1.02, duration: 1 },
    airUpAttack: { reach: 0.92, height: 1.12, damage: 0.94, knockback: 0.98, cooldown: 0.94, startup: 0.9, duration: 0.96 },
    airDownAttack: { reach: 0.92, height: 1.14, damage: 1.02, knockback: 1.04, cooldown: 1.04, startup: 1.06, duration: 1.04 },
    airStrongAttack: { reach: 1, damage: 1, knockback: 1.04, cooldown: 1, startup: 0.98, duration: 1 },
    recoveryMove: { reach: 0.9, height: 1.16, damage: 0.9, knockback: 0.9, cooldown: 1, startup: 0.9, duration: 1.08 }
  };

  function originalMoveProfile(character, attackType) {
    const seed = hashString(`${character.id}:${attackType}:${character.normalAttack}:${character.strongAttack}:${character.skill}`);
    const archetype = character.archetype ?? "midrange";
    const family = inferEffectFamily(character);
    const archetypeMod = ARCHETYPE_MOVE_MODS[archetype] ?? ARCHETYPE_MOVE_MODS.midrange;
    const moveMod = MOVE_TYPE_MODS[attackType] ?? MOVE_TYPE_MODS.normalAttack;
    const strongWeight = attackType.includes("Strong") || attackType === "strongAttack" ? 0.48 : 1;
    const variance = (((seed % 13) - 6) * 0.012) * strongWeight;
    const familyReach = /paper|water|vehicle|light/.test(family) ? 0.06 : /metal|impact/.test(family) ? -0.01 : 0;
    const familyDamage = /food|medical|metal/.test(family) ? 0.04 : /paper|water/.test(family) ? -0.025 : 0;
    const familyKnockback = /metal|impact|vehicle/.test(family) ? 0.06 : /sparkle|medical/.test(family) ? -0.02 : 0;
    const paperLike = /paper|document|book|card|ticket|receipt|lesson|diary|form|memo|script|envelope|tarot|ofuda/.test(family);
    const lightLike = /light|sparkle/.test(family);
    const rangedNormal = attackType === "normalAttack" && ["ranged", "control", "support"].includes(archetype);
    const trickProjectile = attackType === "normalAttack" && archetype === "technical" && seed % 3 === 0;
    return {
      reachMultiplier: clamp(archetypeMod.reach * moveMod.reach + familyReach + variance, 0.72, 1.42),
      heightMultiplier: clamp((moveMod.height ?? 1) + (archetype === "heavy" ? 0.06 : 0) + (lightLike ? 0.04 : 0), 0.78, 1.35),
      damageMultiplier: clamp(archetypeMod.damage * moveMod.damage + familyDamage + variance * 0.75, 0.76, 1.32),
      knockbackMultiplier: clamp(archetypeMod.knockback * moveMod.knockback + familyKnockback + variance * 0.85, 0.76, 1.38),
      damageScaleMultiplier: clamp(1 + familyKnockback * 0.45 + (archetype === "heavy" ? 0.04 : 0) - (archetype === "ranged" ? 0.03 : 0), 0.88, 1.18),
      cooldownMultiplier: clamp(archetypeMod.cooldown * moveMod.cooldown - variance * 0.3, 0.68, 1.35),
      startupMultiplier: clamp(archetypeMod.startup * moveMod.startup - variance * 0.35, 0.62, 1.35),
      durationMultiplier: clamp(archetypeMod.duration * moveMod.duration + variance * 0.25, 0.72, 1.32),
      widthBonus: ((seed >> 5) % 9) - 4,
      heightBonus: ((seed >> 9) % 7) - 3,
      projectile: rangedNormal || trickProjectile,
      projectileKind: paperLike ? "paper" : lightLike ? "spark" : /water/.test(family) ? "water" : "spark",
      projectileSpeedMultiplier: clamp(0.9 + ((seed >> 13) % 7) * 0.045 + (archetype === "mobility" ? 0.12 : 0), 0.84, 1.28),
      projectileVyBonus: attackType === "normalAttack" ? (((seed >> 17) % 5) - 2) * 0.22 : 0,
      selfVelocityX: archetype === "mobility" ? 1.1 + (seed % 4) * 0.35 : archetype === "melee" && attackType.includes("air") ? 0.65 : 0,
      color: effectColorForTheme(character.effectTheme?.[effectThemeKeyForAttack(attackType)] ?? `${family}_${attackType}_${character.id}`, character, attackType)
    };
  }

  function applyCharacterMoveProfile(character, attackType, config, player) {
    const profile = originalMoveProfile(character, attackType);
    const next = { ...config };
    const strongDamp = attackType.includes("Strong") || attackType === "strongAttack" ? 0.62 : 1;
    const blend = (value, multiplier) => 1 + (multiplier - 1) * strongDamp;
    if (typeof next.width === "number") {
      const maxWidth = next.projectile ? 118 : attackType === "recoveryMove" ? 88 : 124;
      next.width = clamp(Math.round(next.width * blend(profile.reachMultiplier, profile.reachMultiplier) + profile.widthBonus), 24, maxWidth);
    }
    if (typeof next.height === "number") {
      const maxHeight = attackType === "recoveryMove" || attackType.includes("Up") ? 96 : 86;
      next.height = clamp(Math.round(next.height * blend(profile.heightMultiplier, profile.heightMultiplier) + profile.heightBonus), 18, maxHeight);
    }
    if (typeof next.damage === "number") next.damage *= blend(profile.damageMultiplier, profile.damageMultiplier);
    if (typeof next.baseKnockback === "number") next.baseKnockback *= blend(profile.knockbackMultiplier, profile.knockbackMultiplier);
    if (typeof next.damageScale === "number") next.damageScale *= blend(profile.damageScaleMultiplier, profile.damageScaleMultiplier);
    if (typeof next.cooldown === "number") next.cooldown = clamp(next.cooldown * blend(profile.cooldownMultiplier, profile.cooldownMultiplier), 0.18, 1.15);
    if (typeof next.startup === "number") next.startup = clamp(next.startup * blend(profile.startupMultiplier, profile.startupMultiplier), 0.015, 0.34);
    if (typeof next.duration === "number") next.duration = clamp(next.duration * blend(profile.durationMultiplier, profile.durationMultiplier), 0.08, 0.38);

    if (profile.projectile && attackType === "normalAttack") {
      next.projectile = true;
      next.projectileKind = profile.projectileKind;
      next.projectileOffsetX = next.projectileOffsetX ?? 10;
      next.projectileOffsetY = next.projectileOffsetY ?? next.offsetY ?? 12;
      next.vx = (next.vx || 6.4) * profile.projectileSpeedMultiplier;
      next.vy = (next.vy || 0) + profile.projectileVyBonus;
      next.damageScale = Math.min(next.damageScale ?? ATTACK_DATA.projectileAttack.damageScale, ATTACK_DATA.projectileAttack.damageScale * 1.18);
    } else if (next.projectile) {
      next.projectileKind = next.projectileKind ?? profile.projectileKind;
      if (typeof next.vx === "number") next.vx *= profile.projectileSpeedMultiplier;
      if (typeof next.vy === "number") next.vy += profile.projectileVyBonus;
    }

    if (profile.selfVelocityX && attackType !== "recoveryMove") {
      next.selfVelocityX = (next.selfVelocityX ?? 0) + profile.selfVelocityX;
    }
    next.color = profile.color ?? next.color;

    const forwardLike = !["upAttack", "airUpAttack", "recoveryMove"].includes(attackType);
    if (player && forwardLike && typeof next.offsetX === "number" && typeof next.width === "number") {
      if (player.facing > 0 && next.offsetX >= player.width - 12) next.offsetX = player.width - 2;
      if (player.facing < 0 && next.offsetX < 0) next.offsetX = -next.width + 2;
    }

    next.damage = typeof next.damage === "number" ? Number(next.damage.toFixed(2)) : next.damage;
    next.baseKnockback = typeof next.baseKnockback === "number" ? Number(next.baseKnockback.toFixed(2)) : next.baseKnockback;
    next.damageScale = typeof next.damageScale === "number" ? Number(next.damageScale.toFixed(3)) : next.damageScale;
    return next;
  }

  function createEffectTheme(character) {
    const family = inferEffectFamily(character);
    const id = character.id;
    return {
      normal: `${family}_quick_${id}`,
      strong: `${family}_impact_${id}`,
      up: `${family}_rise_${id}`,
      down: `${family}_floor_${id}`,
      air: `${family}_spin_${id}`,
      recovery: `${family}_recovery_${id}`,
      skill: `${family}_skill_${id}`,
      ultimate: `${family}_ultimate_${id}`
    };
  }

  function createUltimate(character) {
    const rangeType = (() => {
      if (character.id === "happy_repeat_student") return "area";
      if (["ranged", "support"].includes(character.archetype)) return "ranged";
      if (["technical", "control"].includes(character.archetype)) return "control";
      if (["mobility"].includes(character.archetype)) return "dash";
      if (["heavy", "defense"].includes(character.archetype)) return "area";
      return "melee";
    })();
    const damageBoost = rangeType === "melee" || rangeType === "dash" ? 2 : rangeType === "area" ? 0 : -2;
    const knockbackBoost = rangeType === "ranged" ? -1 : rangeType === "area" ? 1 : 2;
    return {
      name: ULTIMATE_NAME_BY_ID[character.id] ?? `${character.skill}・奥義`,
      description: `${character.job}の道具を総動員する、1分に1回の大技。`,
      cooldown: ULTIMATE_COOLDOWN,
      startup: 0.55,
      active: 0.78,
      endlag: 0.62,
      damage: clamp(ATTACK_DATA.ultimateAttack.damage + damageBoost, 20, 28),
      baseKnockback: clamp(ATTACK_DATA.ultimateAttack.baseKnockback + knockbackBoost, 12, 18),
      damageScale: ATTACK_DATA.ultimateAttack.damageScale,
      rangeType,
      effectType: character.effectTheme?.ultimate ?? `${inferEffectFamily(character)}_ultimate_${character.id}`
    };
  }

  for (const character of characters) {
    character.effectTheme = {
      ...createEffectTheme(character),
      ...(EFFECT_THEME_BY_ID[character.id] ?? {}),
      ...(character.effectTheme ?? {})
    };
    character.ultimate = {
      ...createUltimate(character),
      ...(character.ultimate ?? {})
    };
  }

  const stages = [
    {
      id: "office_tower",
      name: "残業オフィスタワー",
      concept: "夜のオフィスで終電をかけて戦う会社ステージ",
      gimmickName: "残業アラート",
      backgroundType: "office",
      backgroundColor1: "#1b1b3a",
      backgroundColor2: "#4a4e91",
      platformColor: "#2c3f68",
      platforms: [
        { x: 150, y: 420, width: 660, height: 38, type: "main" },
        { x: 80, y: 310, width: 240, height: 27, type: "small" },
        { x: 640, y: 310, width: 240, height: 27, type: "small" },
        { x: 360, y: 230, width: 240, height: 24, type: "small" }
      ],
      hazards: [
        { type: "overtimeAlert", interval: 12, duration: 3, firstTrigger: 4 }
      ],
      spawnPoints: [
        { x: 260, y: 360 },
        { x: 680, y: 360 },
        { x: 165, y: 250 },
        { x: 755, y: 250 }
      ],
      respawnPoints: [
        { x: 405, y: 340 },
        { x: 525, y: 340 },
        { x: 390, y: 170 },
        { x: 540, y: 170 }
      ]
    },
    {
      id: "campus",
      name: "学園キャンパス",
      concept: "講義机と掲示板の上で単位を守り抜く大学ステージ",
      gimmickName: "抜き打ち小テスト",
      backgroundType: "campus",
      backgroundColor1: "#8bd8ff",
      backgroundColor2: "#f6f7b0",
      platformColor: "#2f6f73",
      platforms: [
        { x: 150, y: 420, width: 660, height: 38, type: "main" },
        { x: 82, y: 350, width: 220, height: 26, type: "small" },
        { x: 658, y: 350, width: 220, height: 26, type: "small" },
        { x: 210, y: 282, width: 210, height: 24, type: "small" },
        { x: 540, y: 282, width: 210, height: 24, type: "small" },
        { x: 350, y: 205, width: 260, height: 22, type: "small" }
      ],
      hazards: [
        { type: "popQuiz", interval: 8, duration: 3, firstTrigger: 3 }
      ],
      spawnPoints: [
        { x: 260, y: 360 },
        { x: 680, y: 360 },
        { x: 230, y: 222 },
        { x: 650, y: 222 }
      ],
      respawnPoints: [
        { x: 420, y: 350 },
        { x: 520, y: 350 },
        { x: 390, y: 150 },
        { x: 540, y: 150 }
      ]
    },
    {
      id: "shopping_street",
      name: "商店街パニック",
      concept: "看板とアーケードの間を台車が走る昼の商店街ステージ",
      gimmickName: "暴走台車",
      backgroundType: "shopping",
      backgroundColor1: "#ffd166",
      backgroundColor2: "#70d6ff",
      platformColor: "#6c584c",
      platforms: [
        { x: 120, y: 425, width: 720, height: 38, type: "main" },
        { x: 74, y: 318, width: 240, height: 27, type: "small" },
        { x: 646, y: 318, width: 240, height: 27, type: "small" },
        { x: 330, y: 230, width: 300, height: 24, type: "small" }
      ],
      hazards: [
        { type: "runawayCart", interval: 9, duration: 4.5, firstTrigger: 3 }
      ],
      spawnPoints: [
        { x: 250, y: 365 },
        { x: 690, y: 365 },
        { x: 135, y: 258 },
        { x: 765, y: 258 }
      ],
      respawnPoints: [
        { x: 390, y: 350 },
        { x: 560, y: 350 },
        { x: 405, y: 170 },
        { x: 520, y: 170 }
      ]
    },
    {
      id: "construction_skyline",
      name: "建設現場スカイライン",
      concept: "鉄骨とクレーン足場を渡る高低差多めの建設現場ステージ",
      gimmickName: "動く仮設足場",
      backgroundType: "construction",
      backgroundColor1: "#ff9f6e",
      backgroundColor2: "#394867",
      platformColor: "#495057",
      platforms: [
        { x: 160, y: 425, width: 640, height: 34, type: "main" },
        { x: 78, y: 355, width: 210, height: 25, type: "small" },
        { x: 672, y: 315, width: 210, height: 25, type: "small" },
        { x: 292, y: 260, width: 180, height: 23, type: "moving", moveAxis: "x", moveRange: 80, moveSpeed: 0.7 },
        { x: 488, y: 220, width: 180, height: 23, type: "moving", moveAxis: "x", moveRange: 80, moveSpeed: 0.65, phase: Math.PI },
        { x: 360, y: 150, width: 240, height: 21, type: "small" }
      ],
      hazards: [
        { type: "movingPlatformNotice", interval: 10, duration: 2, firstTrigger: 2 }
      ],
      spawnPoints: [
        { x: 270, y: 360 },
        { x: 660, y: 360 },
        { x: 135, y: 295 },
        { x: 760, y: 255 }
      ],
      respawnPoints: [
        { x: 430, y: 355 },
        { x: 500, y: 355 },
        { x: 390, y: 100 },
        { x: 535, y: 100 }
      ]
    }
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  }

  function createEmptyInput() {
    return {
      moveX: 0,
      up: false,
      down: false,
      jumpPressed: false,
      normalPressed: false,
      strongPressed: false,
      strongHeld: false,
      grabPressed: false,
      skillPressed: false,
      ultimatePressed: false,
      guardHeld: false,
      dodgePressed: false
    };
  }

  function normalizeInput(input = {}) {
    return {
      moveX: clamp(input.moveX ?? ((input.right ? 1 : 0) - (input.left ? 1 : 0)), -1, 1),
      up: Boolean(input.up),
      down: Boolean(input.down),
      jumpPressed: Boolean(input.jumpPressed),
      normalPressed: Boolean(input.normalPressed ?? input.normalAttackPressed),
      strongPressed: Boolean(input.strongPressed ?? input.strongAttackPressed),
      strongHeld: Boolean(input.strongHeld),
      grabPressed: Boolean(input.grabPressed),
      skillPressed: Boolean(input.skillPressed),
      ultimatePressed: Boolean(input.ultimatePressed),
      guardHeld: Boolean(input.guardHeld),
      dodgePressed: Boolean(input.dodgePressed)
    };
  }

  function playSfx(_name) {
    // Audio assets are intentionally not bundled; this hook keeps effect calls sound-ready.
  }

  function effectThemeKeyForAttack(attackType) {
    const map = {
      normalAttack: "normal",
      strongAttack: "strong",
      upAttack: "up",
      upStrongAttack: "up",
      downAttack: "down",
      downStrongAttack: "down",
      airAttack: "air",
      airForwardAttack: "air",
      airBackAttack: "air",
      airUpAttack: "air",
      airDownAttack: "air",
      airStrongAttack: "air",
      recoveryMove: "recovery",
      skill: "skill",
      ultimate: "ultimate"
    };
    return map[attackType] ?? "normal";
  }

  function effectTypeForTheme(theme, attackType) {
    if (attackType === "ultimate" || /ultimate|festival|burst|final/.test(theme)) return "ultimate";
    if (effectThemeKeyForAttack(attackType) === "recovery" || /recovery|jump|lift/.test(theme)) return "recovery";
    if (/water|hose|rain|bubble|foam|wave|fish|aquarium/.test(theme)) return "water";
    if (/paper|card|book|document|ticket|receipt|lesson|diary|stamp|file|form|memo|script|envelope|tarot|ofuda|chalk/.test(theme)) return "paper";
    if (/spark|metal|pan|wrench|hammer|keyboard|bell|dumbbell|barbell|scissors|driver|spanner|tool/.test(theme)) return "spark";
    if (/dust|smoke|powder|steam|flour|mop|brush|vacuum/.test(theme)) return "dust";
    if (/slash|whip|baton|pen|arc|blade|swing|mic|key|rod|hook/.test(theme)) return "slash";
    if (/skill|aura|guard|field|zone|buff|happy|sparkle|star|fortune|shrine|wedding/.test(theme)) return "aura";
    if (["upAttack", "upStrongAttack", "airAttack", "airStrongAttack"].includes(attackType)) return "slash";
    if (["downAttack", "downStrongAttack"].includes(attackType)) return "dust";
    return "impact";
  }

  function effectColorForTheme(theme, character, attackType) {
    if (/water|hose|rain|bubble|foam|aquarium/.test(theme)) return "rgba(68,188,255,0.86)";
    if (/paper|card|book|document|ticket|receipt|lesson|diary|file|form|memo|script|envelope|tarot|ofuda/.test(theme)) return "rgba(255,255,255,0.92)";
    if (/stamp|red_pen|check/.test(theme)) return "rgba(230,57,70,0.88)";
    if (/spark|metal|pan|wrench|hammer|keyboard|bell|tool|dumbbell|barbell/.test(theme)) return "rgba(255,202,58,0.9)";
    if (/dust|smoke|powder|steam|chalk|mop|brush|vacuum/.test(theme)) return "rgba(235,238,240,0.76)";
    if (/fire|flame|spice|yakitori|food|coffee|cake|carrot/.test(theme)) return "rgba(255,123,57,0.86)";
    if (/medical|bandage|chart|capsule|tooth|nurse|doctor/.test(theme)) return "rgba(88,180,174,0.86)";
    if (/light|screen|film|spotlight|camera|flash|star|fortune|shrine|wedding/.test(theme)) return "rgba(255,241,118,0.9)";
    if (attackType === "ultimate") return character.appearance?.accentColor ?? character.color ?? "#ffd23f";
    return character.appearance?.accentColor ?? character.color ?? "rgba(255,255,255,0.88)";
  }

  function effectTextForTheme(theme, character, attackType) {
    if (attackType === "ultimate") return character.ultimate?.name ?? "必殺技！";
    if (/lesson_plan/.test(theme)) return "指導案！";
    if (/training_diary|diary/.test(theme)) return "実習不足！";
    if (/water|hose/.test(theme)) return "放水！";
    if (/chalk/.test(theme)) return "チョーク！";
    if (/stamp|lawyer|approval/.test(theme)) return "決定！";
    if (/spark|pan|hammer|wrench/.test(theme)) return "ガツン！";
    return "";
  }

  function resolvePlatformCollision(player, platform) {
    if (player.eliminated) return;
    const rect = player.getRect();
    const previousBottom = player.prevY + player.height;
    const currentBottom = player.y + player.height;
    const platformRect = platform.getRect();
    const horizontal = rect.x + rect.width > platformRect.x && rect.x < platformRect.x + platformRect.width;

    if (horizontal && player.vy >= 0 && previousBottom <= platformRect.y + 8 && currentBottom >= platformRect.y) {
      player.y = platformRect.y - player.height;
      player.x += platform.dx ?? 0;
      player.vy = 0;
      player.onGround = true;
      player.platformStandingOn = platform;
      player.airJumpsRemaining = player.maxAirJumps;
      player.hasUsedRecovery = false;
    }
  }

  function resolvePlayerCollision(playerA, playerB) {
    if (playerA.eliminated || playerB.eliminated) return;
    if (playerA.grabbedTarget === playerB || playerB.grabbedTarget === playerA) return;
    const a = playerA.getRect();
    const b = playerB.getRect();
    if (!rectsOverlap(a, b)) return;

    const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
    const centerA = a.x + a.width / 2;
    const centerB = b.x + b.width / 2;
    const direction = centerA < centerB ? -1 : 1;
    const push = overlapX / 2 + 0.1;
    playerA.x += direction * push;
    playerB.x -= direction * push;
    playerA.vx *= 0.86;
    playerB.vx *= 0.86;
  }

  function applyDirectionalInfluence(target, vx, vy, power) {
    const input = normalizeInput(target.lastInput ?? {});
    const diX = clamp(input.moveX, -1, 1);
    const diY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const magnitude = Math.hypot(diX, diY);
    if (magnitude < 0.1) return { vx, vy };

    const strength = clamp(0.055 + power * 0.0065, 0.06, 0.18);
    const baseSpeed = Math.max(0.01, Math.hypot(vx, vy));
    let nextVx = vx + (diX / magnitude) * power * strength;
    let nextVy = vy + (diY / magnitude) * power * strength;
    const maxSpeed = baseSpeed * 1.14;
    const nextSpeed = Math.hypot(nextVx, nextVy);
    if (nextSpeed > maxSpeed) {
      const scale = maxSpeed / nextSpeed;
      nextVx *= scale;
      nextVy *= scale;
    }
    return { vx: nextVx, vy: nextVy };
  }

  function applyHitStop(game, attacker, target, damage, baseKnockback) {
    const stop = clamp(0.035 + damage * 0.006 + baseKnockback * 0.004, 0.045, 0.16);
    if (attacker) attacker.hitStopTimer = Math.max(attacker.hitStopTimer ?? 0, stop * 0.82);
    target.hitStopTimer = Math.max(target.hitStopTimer ?? 0, stop);
    if (game) game.freezeFrameTimer = Math.max(game.freezeFrameTimer ?? 0, stop * 0.55);
  }

  function applyKnockback(attacker, target, baseKnockback, angle = null, damageScale = ATTACK_DATA.skillAttack.damageScale) {
    if (target.eliminated) return;
    const sourceX = attacker ? attacker.x + attacker.width / 2 : target.x - target.facing * 20;
    const targetX = target.x + target.width / 2;
    const direction = targetX >= sourceX ? 1 : -1;
    let highDamageMultiplier = 1;
    if (target.damage >= 100) highDamageMultiplier += 0.08;
    if (target.damage >= 150) highDamageMultiplier += 0.12;
    let power = ((baseKnockback + target.damage * damageScale) * highDamageMultiplier) / Math.max(target.weight, 0.65);
    if (target.barrierTimer > 0) power *= 0.56;

    if (angle === null) {
      const influenced = applyDirectionalInfluence(target, direction * power, -3.8 - power * 0.26, power);
      target.vx += influenced.vx;
      target.vy = Math.min(target.vy, influenced.vy);
    } else {
      const influenced = applyDirectionalInfluence(target, Math.cos(angle) * power, Math.sin(angle) * power, power);
      target.vx += influenced.vx;
      target.vy += influenced.vy;
    }
    target.hitStun = Math.max(target.hitStun, clamp(0.1 + power * 0.024, 0.12, 0.68));
    return power;
  }

  function damagePlayer(game, attacker, target, damage, baseKnockback, label = "", angle = null, damageScale = ATTACK_DATA.skillAttack.damageScale) {
    if (target.eliminated || target.invincibleTimer > 0) return false;
    if (target.grabbedBy && typeof target.grabbedBy.releaseGrabbedTarget === "function") target.grabbedBy.releaseGrabbedTarget(false);
    if (attacker?.grabbedTarget && typeof attacker.releaseGrabbedTarget === "function") attacker.releaseGrabbedTarget(false);
    if (target.ledgeHangTimer > 0 && typeof target.finishLedgeAction === "function") target.finishLedgeAction();
    if (target.isChargingSmash && typeof target.cancelSmashCharge === "function") target.cancelSmashCharge();

    if (target.isGuarding && target.guardMeter > 0 && attacker !== target && target.guardBreakTimer <= 0) {
      if (target.guardJustTimer > 0) {
        target.guardJustTimer = 0;
        target.guardMeter = Math.min(100, target.guardMeter + 4);
        target.hitFlashTimer = 0.06;
        target.setVisualState("guard", 0.2);
        target.setSpeech("ジャストガード！", 0.45);
        if (attacker) {
          attacker.hitStopTimer = Math.max(attacker.hitStopTimer ?? 0, 0.18);
          attacker.attackCooldown = Math.max(attacker.attackCooldown, 0.18);
        }
        game.spawnText("ジャストガード！", target.centerX, target.y - 20, "#ffd23f", 0.52, 18);
        game.spawnGuardParticles(target.centerX, target.centerY, "#ffd23f");
        game.screenShake = Math.max(game.screenShake, 3);
        return true;
      }
      const blockedDamage = damage * 0.18;
      target.damage += blockedDamage;
      target.guardMeter = Math.max(0, target.guardMeter - damage * 5.2 - baseKnockback * 2.1);
      applyKnockback(attacker, target, baseKnockback * 0.24, angle, damageScale * 0.35);
      applyHitStop(game, attacker, target, damage * 0.45, baseKnockback * 0.35);
      target.hitFlashTimer = 0.08;
      target.hitStun = Math.max(target.hitStun, 0.06);
      target.setVisualState("guard", 0.18);
      target.setSpeech("ガード！", 0.34);
      game.spawnText("ガード！", target.centerX, target.y - 14, "#7ed3ff", 0.42, 16);
      game.spawnGuardParticles(target.centerX, target.centerY, target.playerColor ?? target.color);
      if (target.guardMeter <= 0) {
        target.guardBreakTimer = 1.1;
        target.isGuarding = false;
        target.hitStun = Math.max(target.hitStun, 0.7);
        target.setSpeech("ガードブレイク！", 0.9);
        game.spawnText("ガードブレイク！", target.centerX, target.y - 26, "#ff5a5f", 0.9, 22);
      }
      return true;
    }

    if (target.counterTimer > 0 && attacker && attacker !== target) {
      target.counterTimer = 0;
      target.setSpeech("カウンター！", 0.7);
      game.spawnText("巡回カウンター！", target.x + target.width / 2, target.y - 12, "#f7ff6b", 0.9);
      attacker.damage += 3;
      applyKnockback(target, attacker, 8, null, ATTACK_DATA.strongAttack.damageScale);
      return false;
    }

    const incomingMultiplier = target.buzzTimer > 0 ? 1.08 : 1;
    target.damage += damage * incomingMultiplier;
    applyKnockback(attacker, target, baseKnockback, angle, damageScale);
    target.hitFlashTimer = 0.18;
    if (typeof target.setVisualState === "function") target.setVisualState("hit", 0.34);
    if (label) target.lastHitLabel = label;
    applyHitStop(game, attacker, target, damage, baseKnockback);
      game.spawnHitParticles(target.x + target.width / 2, target.y + target.height / 2, target.color, target.damage);
      if (attacker && typeof game.spawnCharacterHitEffect === "function") game.spawnCharacterHitEffect(attacker, target, label);
      if (game && typeof game.emitOnlineCombatAction === "function") {
        game.emitOnlineCombatAction("hit", {
          attackerId: attacker?.id ?? null,
          targetId: target.id,
          damage: Number((damage * incomingMultiplier).toFixed(1)),
          targetDamage: Number(target.damage.toFixed(1)),
          knockback: baseKnockback,
          label
        });
      }
      if (target.damage >= 100) game.screenShake = Math.max(game.screenShake, target.damage >= 150 ? 11 : 7);
    if (target.damage >= 150) {
      game.spawnKnockbackLines(target.x + target.width / 2, target.y + target.height / 2, attacker ? Math.sign(target.centerX - attacker.centerX) || target.facing : target.facing);
    }
    return true;
  }

  class Platform {
    constructor(x, y, width, height, options = {}) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.temporary = Boolean(options.temporary);
      this.lifetime = options.lifetime ?? Infinity;
      this.ownerId = options.ownerId ?? null;
      this.color = options.color ?? "#27364a";
      this.type = options.type ?? "small";
      this.dx = 0;
      this.dy = 0;
    }

    getRect() {
      return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    update(dt) {
      this.dx = 0;
      this.dy = 0;
      this.lifetime -= dt;
    }

    draw(ctx) {
      ctx.save();
      ctx.shadowColor = "rgba(24, 33, 47, 0.22)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = this.temporary ? "rgba(255, 210, 63, 0.92)" : this.color;
      roundRect(ctx, this.x, this.y, this.width, this.height, 8);
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.fillStyle = this.temporary ? "rgba(255, 255, 255, 0.46)" : "rgba(255, 255, 255, 0.17)";
      roundRect(ctx, this.x + 8, this.y + 5, this.width - 16, Math.max(5, this.height * 0.28), 5);
      ctx.fill();
      ctx.restore();
    }
  }

  class MovingPlatform extends Platform {
    constructor(x, y, width, height, options = {}) {
      super(x, y, width, height, options);
      this.baseX = x;
      this.baseY = y;
      this.moveAxis = options.moveAxis ?? "x";
      this.moveRange = options.moveRange ?? 60;
      this.moveSpeed = options.moveSpeed ?? 0.65;
      this.phase = options.phase ?? 0;
      this.elapsed = 0;
    }

    update(dt) {
      super.update(dt);
      this.elapsed += dt;
      const previousX = this.x;
      const previousY = this.y;
      const offset = Math.sin(this.elapsed * this.moveSpeed * Math.PI * 2 + this.phase) * this.moveRange;
      if (this.moveAxis === "y") {
        this.y = this.baseY + offset;
      } else {
        this.x = this.baseX + offset;
      }
      this.dx = this.x - previousX;
      this.dy = this.y - previousY;
    }

    draw(ctx) {
      super.draw(ctx);
      ctx.save();
      ctx.strokeStyle = "rgba(255, 210, 63, 0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(this.baseX - this.moveRange, this.baseY - 5, this.width + this.moveRange * 2, this.height + 10);
      ctx.restore();
    }
  }

  class AttackHitbox {
    constructor(options) {
      this.owner = options.owner;
      this.offsetX = options.offsetX ?? 0;
      this.offsetY = options.offsetY ?? 0;
      this.x = options.x ?? 0;
      this.y = options.y ?? 0;
      this.width = options.width;
      this.height = options.height;
      this.damage = options.damage;
      this.baseKnockback = options.baseKnockback;
      this.damageScale = options.damageScale ?? ATTACK_DATA.skillAttack.damageScale;
      this.duration = options.duration;
      this.startup = options.startup ?? 0;
      this.elapsed = 0;
      this.followOwner = options.followOwner ?? true;
      this.color = options.color ?? "rgba(255, 255, 255, 0.45)";
      this.label = options.label ?? "";
      this.hitPlayers = new Set();
      this.expired = false;
      this.angle = options.angle ?? null;
    }

    get active() {
      return this.elapsed >= this.startup;
    }

    getRect() {
      if (!this.followOwner) {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
      }
      return {
        x: this.owner.x + this.offsetX,
        y: this.owner.y + this.offsetY,
        width: this.width,
        height: this.height
      };
    }

    update(dt, game) {
      this.elapsed += dt;
      if (this.elapsed > this.startup + this.duration) {
        this.expired = true;
        return;
      }
      if (!this.active) return;

      const rect = this.getRect();
      for (const player of game.players) {
        if (player === this.owner || player.eliminated || this.hitPlayers.has(player.id)) continue;
        if (rectsOverlap(rect, player.getRect())) {
          this.hitPlayers.add(player.id);
          damagePlayer(game, this.owner, player, this.damage, this.baseKnockback, this.label, this.angle, this.damageScale);
        }
      }
    }

    draw(ctx, debug) {
      if (!debug) return;
      const rect = this.getRect();
      ctx.save();
      ctx.globalAlpha = this.active ? 1 : 0.32;
      ctx.fillStyle = this.color;
      roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 6);
      ctx.fill();
      ctx.strokeStyle = debug ? "rgba(255, 255, 255, 0.9)" : "rgba(24, 33, 47, 0.18)";
      ctx.lineWidth = debug ? 2 : 1;
      ctx.stroke();
      if (this.label && this.active) {
        ctx.fillStyle = "#18212f";
        ctx.font = "700 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.label, rect.x + rect.width / 2, rect.y - 6);
      }
      ctx.restore();
    }
  }

  class Projectile {
    constructor(options) {
      this.owner = options.owner;
      this.x = options.x;
      this.y = options.y;
      this.width = options.width;
      this.height = options.height;
      this.vx = options.vx ?? 0;
      this.vy = options.vy ?? 0;
      this.duration = options.duration ?? 1.2;
      this.elapsed = 0;
      this.damage = options.damage ?? 4;
      this.baseKnockback = options.baseKnockback ?? 4;
      this.damageScale = options.damageScale ?? ATTACK_DATA.projectileAttack.damageScale;
      this.label = options.label ?? "";
      this.color = options.color ?? "rgba(255,255,255,0.72)";
      this.affliction = options.affliction ?? "";
      this.angle = options.angle ?? null;
      this.piercing = Boolean(options.piercing);
      this.hitPlayers = new Set();
      this.expired = false;
      this.kind = options.kind ?? "paper";
    }

    getRect() {
      return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    update(dt, game) {
      this.elapsed += dt;
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      if (this.elapsed >= this.duration || this.x < -140 || this.x > W + 140 || this.y < -180 || this.y > H + 180) {
        this.expired = true;
        return;
      }

      for (const player of game.players) {
        if (player === this.owner || player.eliminated || this.hitPlayers.has(player.id)) continue;
        if (!rectsOverlap(this.getRect(), player.getRect())) continue;
        this.hitPlayers.add(player.id);
        damagePlayer(game, this.owner, player, this.damage, this.baseKnockback, this.label, this.angle, this.damageScale);
        if (this.affliction === "slow") player.slowTimer = Math.max(player.slowTimer, 0.8);
        if (this.affliction === "glitch") player.controlGlitchTimer = Math.max(player.controlGlitchTimer, 0.6);
        if (this.affliction === "push") player.vx += this.owner.facing * 4;
        if (!this.piercing) this.expired = true;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - this.elapsed / this.duration, 0.28, 1);
      ctx.fillStyle = this.color;
      ctx.strokeStyle = "rgba(24,33,47,0.22)";
      ctx.lineWidth = 1.4;
      if (this.kind === "paper" || this.kind === "lesson_plan") {
        roundRect(ctx, this.x, this.y, this.width, this.height, 3);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = this.kind === "lesson_plan" ? "#e63946" : "rgba(24,33,47,0.28)";
        ctx.beginPath();
        ctx.moveTo(this.x + 7, this.y + this.height * 0.35);
        ctx.lineTo(this.x + this.width - 8, this.y + this.height * 0.28);
        ctx.moveTo(this.x + 8, this.y + this.height * 0.62);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height * 0.58);
        ctx.stroke();
      } else {
        roundRect(ctx, this.x, this.y, this.width, this.height, 6);
        ctx.fill();
        ctx.stroke();
      }
      if (this.label) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#18212f";
        ctx.font = "800 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.x + this.width / 2, this.y - 6);
      }
      ctx.restore();
    }

    toNetworkState() {
      return {
        x: Math.round(this.x),
        y: Math.round(this.y),
        width: this.width,
        height: this.height,
        vx: Number(this.vx.toFixed(2)),
        vy: Number(this.vy.toFixed(2)),
        label: this.label,
        color: this.color,
        kind: this.kind
      };
    }
  }

  class SkillEffect {
    constructor(options) {
      Object.assign(this, options);
      this.elapsed = 0;
      this.duration = options.duration ?? 1;
      this.hitPlayers = new Set();
      this.pulseTimers = new Map();
      this.expired = false;
      this.color = options.color ?? "rgba(255, 255, 255, 0.5)";
      this.label = options.label ?? "";
      this.damageScale = options.damageScale ?? ATTACK_DATA.skillAttack.damageScale;
    }

    getRect() {
      return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    update(dt, game) {
      this.elapsed += dt;
      if (this.elapsed >= this.duration) {
        this.expired = true;
        return;
      }

      if (this.type === "projectile") {
        this.x += this.vx * dt * 60;
        this.y += (this.vy ?? 0) * dt * 60;
        this.checkPlayerHits(game);
        if (this.x < -120 || this.x > W + 120 || this.y < -160 || this.y > H + 160) this.expired = true;
      }

      if (this.type === "zone" || this.type === "trap" || this.type === "wax" || this.type === "shield") {
        this.applyZone(game, dt);
      }
    }

    checkPlayerHits(game) {
      for (const player of game.players) {
        if (player === this.owner || player.eliminated || this.hitPlayers.has(player.id)) continue;
        if (rectsOverlap(this.getRect(), player.getRect())) {
          this.hitPlayers.add(player.id);
          damagePlayer(game, this.owner, player, this.damage ?? 5, this.baseKnockback ?? 5, this.label, null, this.damageScale);
          if (this.affliction === "slow") player.slowTimer = Math.max(player.slowTimer, 0.8);
          if (this.affliction === "glitch") player.controlGlitchTimer = Math.max(player.controlGlitchTimer, 0.6);
          if (this.affliction === "push") player.vx += this.owner.facing * 4;
          if (!this.piercing) this.expired = true;
        }
      }
    }

    applyZone(game, dt) {
      const rect = this.getRect();
      for (const player of game.players) {
        if (player === this.owner || player.eliminated) continue;
        if (!rectsOverlap(rect, player.getRect())) continue;

        if (this.effect === "slow") player.slowTimer = Math.max(player.slowTimer, 0.35);
        if (this.effect === "stop") {
          player.slowTimer = Math.max(player.slowTimer, 0.45);
          player.hitStun = Math.max(player.hitStun, 0.06);
        }
        if (this.effect === "wax") {
          player.slipTimer = Math.max(player.slipTimer, 0.45);
          player.vx += this.owner.facing * 0.24;
        }
        if (this.effect === "shield") {
          player.vx += this.owner.facing * 0.35;
        }
        if (this.effect === "damagePulse") {
          const nextPulse = this.pulseTimers.get(player.id) ?? 0;
          if (this.elapsed >= nextPulse) {
            this.pulseTimers.set(player.id, this.elapsed + (this.pulseRate ?? 0.28));
            damagePlayer(game, this.owner, player, this.damage ?? 2, this.baseKnockback ?? 2, this.label, null, this.damageScale);
          }
        }
        if (this.type === "trap" && !this.hitPlayers.has(player.id)) {
          this.hitPlayers.add(player.id);
          damagePlayer(game, this.owner, player, this.damage ?? 6, this.baseKnockback ?? 5, this.label, null, this.damageScale);
          this.expired = true;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      const alpha = clamp(1 - this.elapsed / this.duration, 0.22, 0.95);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;

      if (this.shape === "circle") {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        roundRect(ctx, this.x, this.y, this.width, this.height, this.type === "projectile" ? 4 : 8);
        ctx.fill();
      }

      if (this.label) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#18212f";
        ctx.font = "800 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.x + this.width / 2, this.y - 8);
      }
      ctx.restore();
    }
  }

  class AttackEffect {
    constructor({ x, y, vx = 0, vy = 0, type = "impact", ownerId = null, duration = 0.36, scale = 1, rotation = 0, color = "#ffffff", data = {} }) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.type = type;
      this.ownerId = ownerId;
      this.duration = duration;
      this.scale = scale;
      this.rotation = rotation;
      this.color = color;
      this.data = data;
      this.elapsed = 0;
      this.expired = false;
    }

    update(dt) {
      this.elapsed += dt;
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      if (this.elapsed >= this.duration) this.expired = true;
    }

    draw(ctx) {
      const t = clamp(this.elapsed / this.duration, 0, 1);
      const alpha = clamp((1 - t) * (this.data.alpha ?? 0.95), 0, 1);
      const direction = this.data.direction ?? 1;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(this.x, this.y);

      if (this.type === "ultimate") {
        this.drawUltimate(ctx, t);
        ctx.restore();
        return;
      }

      ctx.rotate(this.rotation);
      ctx.scale(direction * this.scale, this.scale);

      if (this.type === "paper") this.drawPaper(ctx, t);
      else if (this.type === "water") this.drawWater(ctx, t);
      else if (this.type === "spark") this.drawSpark(ctx, t);
      else if (this.type === "dust") this.drawDust(ctx, t);
      else if (this.type === "slash") this.drawSlash(ctx, t);
      else if (this.type === "recovery") this.drawRecovery(ctx, t);
      else if (this.type === "aura") this.drawAuraBurst(ctx, t);
      else this.drawImpact(ctx, t);

      ctx.restore();
    }

    drawPaper(ctx, t) {
      const sheets = this.data.sheets ?? 2;
      for (let i = 0; i < sheets; i += 1) {
        const offset = (i - (sheets - 1) / 2) * 13;
        ctx.save();
        ctx.translate(20 + i * 8 + t * 30, offset + Math.sin(t * Math.PI + i) * 7);
        ctx.rotate(-0.22 + i * 0.18 + t * 0.5);
        ctx.fillStyle = "rgba(255,255,255,0.96)";
        ctx.strokeStyle = "rgba(24,33,47,0.28)";
        ctx.lineWidth = 1.4;
        roundRect(ctx, -16, -11, 32, 22, 3);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = this.data.markColor ?? "#e63946";
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(-10, -3);
        ctx.lineTo(4, -5);
        ctx.moveTo(-8, 4);
        ctx.lineTo(10, 1);
        if (this.data.check) {
          ctx.moveTo(7, 7);
          ctx.lineTo(11, 11);
          ctx.lineTo(18, 1);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    drawWater(ctx, t) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 6 * (1 - t) + 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.bezierCurveTo(28, -15, 56, 15, 92 + t * 24, -4);
      ctx.stroke();
      ctx.fillStyle = this.color;
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.arc(14 + i * 12 + t * 24, Math.sin(i + t * 6) * 12, 2.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawSpark(ctx, t) {
      ctx.strokeStyle = this.color;
      ctx.lineCap = "round";
      for (let i = 0; i < 10; i += 1) {
        const angle = -0.7 + i * 0.15 + (this.data.spread ?? 0);
        const len = (18 + i * 2) * (1 - t * 0.35);
        ctx.lineWidth = i % 2 === 0 ? 3 : 1.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 5 * (1 - t), 0, Math.PI * 2);
      ctx.fill();
    }

    drawDust(ctx, t) {
      for (let i = 0; i < 7; i += 1) {
        ctx.fillStyle = i % 2 === 0 ? this.color : "rgba(255,255,255,0.72)";
        ctx.beginPath();
        ctx.arc(-10 + i * 16 + t * 16, 4 + Math.sin(i) * 7, (7 + i % 3) * (1 - t * 0.28), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawSlash(ctx, t) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 8 * (1 - t) + 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(16, 0, 42 + t * 18, -0.75, 0.8);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.86)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(18, 0, 31 + t * 10, -0.68, 0.72);
      ctx.stroke();
    }

    drawRecovery(ctx, t) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-18 + i * 12, 24);
        ctx.quadraticCurveTo(-8 + i * 12, -10 - t * 30, 4 + i * 10, -42 - t * 28);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.arc(-22 + i * 12, 22 + t * 18, 4 * (1 - t * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawAuraBurst(ctx, t) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 24 + t * 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = this.color;
      for (let i = 0; i < 7; i += 1) {
        const angle = i * Math.PI * 2 / 7 + t * 2;
        CharacterRenderer.drawStar(ctx, Math.cos(angle) * (26 + t * 32), Math.sin(angle) * (18 + t * 24), 4 + (i % 2));
      }
    }

    drawImpact(ctx, t) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5 * (1 - t) + 1;
      ctx.beginPath();
      ctx.ellipse(18, 0, 35 + t * 26, 18 + t * 12, -0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = this.color;
      for (let i = 0; i < 6; i += 1) {
        const angle = -0.8 + i * 0.32;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * (24 + t * 32), Math.sin(angle) * (14 + t * 18), 3 + i % 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawUltimate(ctx, t) {
      const radius = (this.data.radius ?? 112) * (0.7 + t * 0.55);
      ctx.save();
      const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
      gradient.addColorStop(0, "rgba(255,255,255,0.96)");
      gradient.addColorStop(0.36, this.color);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5 * (1 - t) + 1.5;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(0, 0, radius * (0.35 + i * 0.23), 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 14; i += 1) {
        const angle = i * Math.PI * 2 / 14 + t * 3;
        ctx.strokeStyle = i % 2 === 0 ? "#ffffff" : this.color;
        ctx.lineWidth = i % 2 === 0 ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
        ctx.lineTo(Math.cos(angle) * (radius + 18), Math.sin(angle) * (radius + 18));
        ctx.stroke();
      }
      if (this.data.text) {
        ctx.globalAlpha = 1;
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(24,33,47,0.42)";
        ctx.strokeText(this.data.text, 0, -radius * 0.32);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(this.data.text, 0, -radius * 0.32);
      }
      ctx.restore();
    }

    toNetworkState() {
      return {
        x: Math.round(this.x),
        y: Math.round(this.y),
        vx: Number(this.vx.toFixed(2)),
        vy: Number(this.vy.toFixed(2)),
        type: this.type,
        ownerId: this.ownerId,
        duration: Number(Math.max(0.06, this.duration - this.elapsed).toFixed(2)),
        scale: Number(this.scale.toFixed(2)),
        rotation: Number(this.rotation.toFixed(2)),
        color: this.color,
        data: this.data
      };
    }
  }

  class Particle {
    constructor(x, y, options = {}) {
      this.x = x;
      this.y = y;
      this.vx = options.vx ?? (Math.random() - 0.5) * 4;
      this.vy = options.vy ?? (Math.random() - 0.7) * 5;
      this.life = options.life ?? 0.6;
      this.maxLife = this.life;
      this.size = options.size ?? 5;
      this.color = options.color ?? "#ffffff";
      this.text = options.text ?? "";
      this.fontSize = options.fontSize ?? 18;
      this.lineAngle = options.lineAngle ?? null;
      this.lineLength = options.lineLength ?? 0;
      this.lineWidth = options.lineWidth ?? 2;
    }

    update(dt) {
      this.life -= dt;
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.vy += 0.12 * dt * 60;
    }

    draw(ctx) {
      const alpha = clamp(this.life / this.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (this.text) {
        ctx.font = `900 ${this.fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255,255,255,0.86)";
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
      } else if (this.lineAngle !== null) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.lineAngle) * this.lineLength, this.y - Math.sin(this.lineAngle) * this.lineLength);
        ctx.stroke();
      } else {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class BattleItem {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.prevY = y;
      this.width = 28;
      this.height = 28;
      this.vx = (Math.random() - 0.5) * 1.8;
      this.vy = -2.8 - Math.random() * 1.6;
      this.life = 18;
      this.collected = false;
      this.bob = Math.random() * Math.PI * 2;
    }

    getRect() {
      return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    update(dt, game) {
      this.life -= dt;
      this.prevY = this.y;
      this.vy = clamp(this.vy + GRAVITY * dt * 60, -12, 12);
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.vx *= Math.pow(0.985, dt * 60);
      for (const platform of game.platforms) {
        const rect = platform.getRect();
        const previousBottom = this.prevY + this.height;
        const currentBottom = this.y + this.height;
        if (this.x + this.width > rect.x && this.x < rect.x + rect.width && this.vy >= 0 && previousBottom <= rect.y + 8 && currentBottom >= rect.y) {
          this.y = rect.y - this.height;
          this.vy = -Math.abs(this.vy) * 0.18;
          if (Math.abs(this.vy) < 0.8) this.vy = 0;
        }
      }
      if (this.x < 12 || this.x + this.width > W - 12) this.vx *= -0.55;

      for (const player of game.players) {
        if (player.eliminated || player.invincibleTimer > 0 || player.grabbedBy) continue;
        if (rectsOverlap(this.getRect(), player.getRect())) {
          this.applyTo(game, player);
          this.collected = true;
          break;
        }
      }
    }

    applyTo(game, player) {
      if (this.type === "coffee") {
        player.speedBoostTimer = Math.max(player.speedBoostTimer, 4.2);
        player.speedBoostMultiplier = Math.max(player.speedBoostMultiplier, 1.22);
        game.spawnText("差し入れコーヒー", player.centerX, player.y - 20, "#8d5a2b", 0.8, 16);
      } else if (this.type === "first_aid") {
        player.damage = Math.max(0, player.damage - 18);
        game.spawnText("救急ポーチ", player.centerX, player.y - 20, "#58b4ae", 0.8, 16);
      } else {
        game.spawnText("残業爆弾！", this.x + this.width / 2, this.y - 10, "#ff5a5f", 0.8, 18);
        game.hitboxes.push(new AttackHitbox({
          owner: player,
          followOwner: false,
          x: this.x - 42,
          y: this.y - 42,
          width: 112,
          height: 112,
          damage: 9,
          baseKnockback: 8,
          damageScale: ATTACK_DATA.strongAttack.damageScale,
          duration: 0.16,
          startup: 0,
          color: "rgba(255, 90, 95, 0.42)",
          label: "残業爆発！"
        }));
        game.screenShake = Math.max(game.screenShake, 7);
      }
      for (let i = 0; i < 12; i += 1) {
        game.particles.push(new Particle(player.centerX, player.centerY, {
          color: this.type === "first_aid" ? "#58b4ae" : this.type === "coffee" ? "#ffca3a" : "#ff5a5f",
          size: 2 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 5,
          life: 0.35 + Math.random() * 0.25
        }));
      }
    }

    draw(ctx) {
      const t = performance.now() / 1000 + this.bob;
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2 + Math.sin(t * 4) * 2;
      ctx.save();
      ctx.shadowColor = "rgba(24,33,47,0.25)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = this.type === "coffee" ? "#8d5a2b" : this.type === "first_aid" ? "#ffffff" : "#ff5a5f";
      roundRect(ctx, this.x, this.y + Math.sin(t * 4) * 2, this.width, this.height, 6);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(24,33,47,0.28)";
      ctx.lineWidth = 2;
      roundRect(ctx, this.x, this.y + Math.sin(t * 4) * 2, this.width, this.height, 6);
      ctx.stroke();
      ctx.fillStyle = this.type === "coffee" ? "#fff3d0" : this.type === "first_aid" ? "#e63946" : "#ffd23f";
      ctx.font = "900 17px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.type === "coffee" ? "C" : this.type === "first_aid" ? "+" : "!", cx, cy);
      ctx.restore();
    }
  }

  class KeyboardController {
    constructor(game) {
      this.game = game;
      this.controllerType = "local";
      this.currentInput = createEmptyInput();
    }

    update() {
      const scheme = localControls;
      const moveFromKeys = (this.game.keys.has(scheme.right) ? 1 : 0) - (this.game.keys.has(scheme.left) ? 1 : 0);
      const pad = this.game.getGamepadInput(0);
      const touch = this.game.getTouchInput();
      const moveX = touch.moveX !== 0 ? touch.moveX : pad.moveX !== 0 ? pad.moveX : moveFromKeys;
      this.currentInput = normalizeInput({
        moveX,
        up: this.game.keys.has(scheme.up) || pad.up || touch.up,
        down: this.game.keys.has(scheme.down) || pad.down || touch.down,
        jumpPressed: this.game.pressedKeys.has(scheme.jump) || pad.jumpPressed || touch.jumpPressed,
        normalPressed: this.game.pressedKeys.has(scheme.normal) || pad.normalPressed || touch.normalPressed,
        strongPressed: this.game.pressedKeys.has(scheme.strong) || pad.strongPressed || touch.strongPressed,
        strongHeld: this.game.keys.has(scheme.strong) || pad.strongHeld || touch.strongHeld,
        grabPressed: this.game.pressedKeys.has(scheme.grab) || pad.grabPressed || touch.grabPressed,
        skillPressed: this.game.pressedKeys.has(scheme.skill) || pad.skillPressed || touch.skillPressed,
        ultimatePressed: this.game.pressedKeys.has(scheme.ultimate) || pad.ultimatePressed || touch.ultimatePressed,
        guardHeld: this.game.keys.has(scheme.guard) || pad.guardHeld || touch.guardHeld,
        dodgePressed: this.game.pressedKeys.has(scheme.dodge) || pad.dodgePressed || touch.dodgePressed
      });
      return this.currentInput;
    }
  }

  class NetworkController {
    constructor(game, playerIndex) {
      this.game = game;
      this.playerIndex = playerIndex;
      this.controllerType = "online";
      this.currentInput = createEmptyInput();
    }

    update() {
      this.currentInput = normalizeInput(this.game.networkInputs.get(this.playerIndex));
      return this.currentInput;
    }
  }

  class CPUController {
    constructor(player, game, difficulty = "Normal") {
      this.player = player;
      this.game = game;
      this.difficulty = difficulty;
      this.controllerType = "cpu";
      this.currentInput = createEmptyInput();
      this.reactionTimer = 0;
      this.attackTimer = 0.4 + Math.random() * 0.3;
      this.skillTimer = 2 + Math.random() * 2;
      this.ultimateThinkTimer = 4 + Math.random() * 5;
      this.defenseTimer = 0.6 + Math.random() * 0.8;
      this.jumpTimer = 0;
      this.recoveryIntentTimer = 0;
    }

    get tuning() {
      if (this.difficulty === "Easy") {
        return { reaction: 0.34, attack: 1.15, skill: 7.5, recoveryChance: 0.42, preferredRange: 76, precision: 0.55 };
      }
      if (this.difficulty === "Hard") {
        return { reaction: 0.08, attack: 0.42, skill: 3.8, recoveryChance: 0.94, preferredRange: 116, precision: 0.95 };
      }
      return { reaction: 0.18, attack: 0.72, skill: 5.2, recoveryChance: 0.72, preferredRange: 92, precision: 0.78 };
    }

    update(dt) {
      const player = this.player;
      if (player.eliminated) {
        this.currentInput = createEmptyInput();
        return this.currentInput;
      }

      this.reactionTimer -= dt;
      this.attackTimer -= dt;
      this.skillTimer -= dt;
      this.ultimateThinkTimer -= dt;
      this.defenseTimer -= dt;
      this.jumpTimer -= dt;
      this.recoveryIntentTimer -= dt;

      if (this.reactionTimer > 0) return this.currentInput;

      const tuning = this.tuning;
      const target = this.chooseTarget();
      const input = createEmptyInput();
      if (!target) {
        this.currentInput = input;
        return input;
      }

      this.reactionTimer = tuning.reaction;
      const recovering = this.tryRecover(input, tuning);
      if (!recovering) {
        const defending = this.useDefenseIfThreat(target, input);
        if (!defending) {
          this.moveTowardTarget(target, input, tuning);
          this.tryAttack(target, input, tuning);
          this.useSkillIfUseful(target, input, tuning);
          this.useUltimateIfUseful(target, input);
        }
      }

      this.currentInput = input;
      return input;
    }

    chooseTarget() {
      let best = null;
      let bestDistance = Infinity;
      for (const other of this.game.players) {
        if (other === this.player || other.eliminated) continue;
        const dx = other.centerX - this.player.centerX;
        const dy = other.centerY - this.player.centerY;
        const distance = Math.hypot(dx, dy);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = other;
        }
      }
      return best;
    }

    moveTowardTarget(target, input, tuning) {
      const dx = target.centerX - this.player.centerX;
      const dy = target.centerY - this.player.centerY;
      const ranged = ["ranged", "control", "support"].includes(this.player.selectedCharacter.archetype);
      const desiredRange = ranged ? tuning.preferredRange + 60 : tuning.preferredRange;
      if (Math.abs(dx) > desiredRange) {
        input.moveX = Math.sign(dx);
      } else if (ranged && Math.abs(dx) < desiredRange * 0.62) {
        input.moveX = -Math.sign(dx || this.player.facing);
      }
      if (dy < -50 && this.jumpTimer <= 0 && this.player.wasGrounded) {
        input.jumpPressed = true;
        this.jumpTimer = this.difficulty === "Hard" ? 0.55 : 0.9;
      }
    }

    tryAttack(target, input, tuning) {
      if (this.attackTimer > 0 || this.player.attackCooldown > 0 || this.player.hitStun > 0) return;
      const dx = target.centerX - this.player.centerX;
      const dy = target.centerY - this.player.centerY;
      const distance = Math.hypot(dx, dy);
      const ranged = this.player.selectedCharacter.archetype === "ranged";
      const attackRange = ranged ? 240 : 95;
      if (distance > attackRange) return;

      const grabChance = this.difficulty === "Easy" ? 0.08 : this.difficulty === "Hard" ? 0.28 : 0.16;
      if (distance < 48 && this.player.grabCooldownTimer <= 0 && (target.isGuarding || Math.random() < grabChance)) {
        input.grabPressed = true;
        if (dy < -18 && Math.random() < tuning.precision) input.up = true;
        if (dy > 22 && Math.random() < tuning.precision) input.down = true;
        this.attackTimer = tuning.attack + 0.25;
        return;
      }

      input.up = dy < -34 && Math.random() < tuning.precision;
      input.down = dy > 30 && Math.random() < tuning.precision;
      if (!this.player.onGround && this.difficulty === "Hard") input.up = dy < 0;
      const useStrong = distance < 90 && Math.random() < (this.difficulty === "Hard" ? 0.44 : 0.24);
      if (!this.player.onGround && this.player.vy > 1.5 && Math.random() < tuning.precision) {
        input.strongPressed = true;
      } else if (useStrong) {
        input.strongPressed = true;
      } else {
        input.normalPressed = true;
      }
      this.attackTimer = tuning.attack + Math.random() * tuning.attack * 0.65;
    }

    tryRecover(input, tuning) {
      const player = this.player;
      const activeStage = this.game.stageManager.activeStage;
      const main = activeStage?.platforms?.find((platform) => platform.type === "main") ?? { x: 180, y: 420, width: 600 };
      const stageCenter = main.x + main.width / 2;
      const tooLow = player.y > main.y + 65;
      const tooFar = player.centerX < main.x - 70 || player.centerX > main.x + main.width + 70;
      if (!tooLow && !tooFar) return false;

      input.moveX = Math.sign(stageCenter - player.centerX) || 0;
      input.up = true;
      if (this.recoveryIntentTimer <= 0 && Math.random() < tuning.recoveryChance) {
        if (player.airJumpsRemaining > 0) {
          input.jumpPressed = true;
        } else if (!player.hasUsedRecovery) {
          input.strongPressed = true;
        }
        this.recoveryIntentTimer = this.difficulty === "Easy" ? 0.85 : 0.34;
      }
      return true;
    }

    useSkillIfUseful(target, input, tuning) {
      if (this.skillTimer > 0 || this.player.skillCooldownTimer > 0) return;
      const distance = Math.abs(target.centerX - this.player.centerX);
      const chance = this.difficulty === "Easy" ? 0.28 : this.difficulty === "Hard" ? 0.72 : 0.48;
      if (distance < 190 && Math.random() < chance) input.skillPressed = true;
      this.skillTimer = tuning.skill + Math.random() * 2.5;
    }

    useUltimateIfUseful(target, input) {
      if (this.ultimateThinkTimer > 0 || this.player.ultimateCooldownTimer > 0 || this.player.isUsingUltimate) return;
      const distance = Math.hypot(target.centerX - this.player.centerX, target.centerY - this.player.centerY);
      const targetIsDamaged = target.damage >= (this.difficulty === "Hard" ? 45 : 70);
      const comeback = this.player.damage >= (this.difficulty === "Easy" ? 135 : 95);
      const chance = this.difficulty === "Easy" ? 0.25 : this.difficulty === "Hard" ? 0.72 : 0.48;
      if (distance < 260 && (targetIsDamaged || comeback) && Math.random() < chance) {
        input.ultimatePressed = true;
        this.ultimateThinkTimer = 10 + Math.random() * 8;
      } else {
        this.ultimateThinkTimer = 4 + Math.random() * 5;
      }
    }

    useDefenseIfThreat(target, input) {
      if (this.defenseTimer > 0 || this.player.guardBreakTimer > 0 || this.player.dodgeCooldownTimer > 0) return false;
      const dx = target.centerX - this.player.centerX;
      const dy = Math.abs(target.centerY - this.player.centerY);
      const distance = Math.hypot(dx, dy);
      const threat = distance < 115 && (target.attackCooldown > 0 || target.isUsingUltimate || Math.random() < 0.18);
      if (!threat) return false;

      const dodgeChance = this.difficulty === "Easy" ? 0.22 : this.difficulty === "Hard" ? 0.58 : 0.38;
      if (Math.random() < dodgeChance && this.player.guardMeter >= 16) {
        input.moveX = -Math.sign(dx || this.player.facing);
        input.dodgePressed = true;
        this.defenseTimer = this.difficulty === "Hard" ? 1.0 : 1.7;
      } else {
        input.guardHeld = true;
        this.defenseTimer = this.difficulty === "Hard" ? 0.38 : 0.62;
      }
      return true;
    }
  }

  class CharacterRenderer {
    static draw(ctx, player) {
      const model = {
        character: player.selectedCharacter,
        centerX: player.centerX,
        footY: player.y + player.height,
        facing: player.facing || 1,
        state: player.state || "idle",
        time: player.animationTime || 0,
        playerColor: player.playerColor || player.color,
        damage: player.damage,
        hitFlashTimer: player.hitFlashTimer,
        invincibleTimer: player.invincibleTimer,
        happyBuffTimer: player.happyBuffTimer,
        skillTimer: player.skillPoseTimer || 0,
        isGuarding: player.isGuarding,
        guardMeter: player.guardMeter,
        dodgeTimer: player.dodgeTimer,
        guardBreakTimer: player.guardBreakTimer,
        name: player.name,
        playerNumber: player.playerNumber,
        speechText: player.speechText,
        speechTimer: player.speechTimer,
        showLabel: true,
        scale: player.drawHeight ? player.drawHeight / 62 : 1,
        ultimatePhase: player.ultimatePhase
      };
      this.drawModel(ctx, model);
    }

    static drawPreview(ctx, character, x, y, scale = 1, playerColor = "#ff5a5f") {
      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.drawModel(ctx, {
        character,
        centerX: x,
        footY: y,
        facing: 1,
        state: "idle",
        time: performance.now() / 1000,
        playerColor,
        damage: 0,
        hitFlashTimer: 0,
        invincibleTimer: 0,
        happyBuffTimer: 0,
        skillTimer: 0,
        showLabel: false,
        scale
      });
      ctx.restore();
    }

    static drawModel(ctx, model) {
      const appearance = model.character.appearance || defaultAppearance;
      const scale = model.scale || 1;
      const pose = this.getPose(model);
      const alpha = model.invincibleTimer > 0 && Math.sin(performance.now() / 70) > 0 ? 0.58 : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      this.drawShadow(ctx, model, scale);
      this.drawAura(ctx, model, scale);
      ctx.translate(model.centerX, model.footY + pose.bob * scale);
      ctx.scale((model.facing || 1) * scale, scale);
      ctx.rotate(pose.tilt);

      this.drawLegs(ctx, appearance, pose, model);
      this.drawBackArm(ctx, appearance, pose, model);
      this.drawBody(ctx, appearance, pose, model);
      this.drawCostume(ctx, appearance, model);
      this.drawFrontArm(ctx, appearance, pose, model);
      this.drawHead(ctx, appearance, pose, model);
      this.drawHair(ctx, appearance, model);
      this.drawFace(ctx, appearance, pose, model);
      this.drawHeldItem(ctx, appearance, pose, model);
      this.drawPoseEffects(ctx, appearance, pose, model);

      ctx.restore();
      if (model.showLabel) this.drawPlayerLabel(ctx, model);
    }

    static getPose(model) {
      const cycle = Math.sin((model.time || 0) * 12);
      const pose = {
        bob: model.state === "idle" ? Math.sin((model.time || 0) * 4) * 1.2 : 0,
        tilt: 0,
        legSwing: 0,
        frontArm: { x: 18, y: -25 },
        backArm: { x: -17, y: -22 },
        headX: 0,
        headY: 0,
        itemAngle: 0,
        expression: "normal"
      };

      if (model.state === "run") {
        pose.tilt = 0.12;
        pose.legSwing = cycle;
        pose.frontArm = { x: 15 - cycle * 4, y: -24 + cycle * 3 };
        pose.backArm = { x: -16 + cycle * 4, y: -24 - cycle * 3 };
        pose.bob = Math.abs(cycle) * -1.5;
      }
      if (model.state === "jump" || model.state === "fall") {
        pose.tilt = model.state === "jump" ? -0.08 : 0.07;
        pose.legSwing = 0.45;
        pose.frontArm = { x: 20, y: -34 };
        pose.backArm = { x: -20, y: -31 };
      }
      if (model.state === "attack") {
        pose.tilt = 0.08;
        pose.frontArm = { x: 31, y: -27 };
        pose.backArm = { x: -14, y: -31 };
        pose.itemAngle = -0.25;
      }
      if (model.state === "upAttack") {
        pose.tilt = -0.06;
        pose.frontArm = { x: 13, y: -52 };
        pose.backArm = { x: -14, y: -42 };
        pose.itemAngle = -1.35;
      }
      if (model.state === "upStrongAttack") {
        pose.tilt = -0.12;
        pose.frontArm = { x: 29, y: -43 };
        pose.backArm = { x: -18, y: -34 };
        pose.itemAngle = -0.78;
      }
      if (model.state === "downAttack" || model.state === "downStrongAttack") {
        pose.tilt = model.state === "downStrongAttack" ? 0.16 : 0.12;
        pose.frontArm = { x: 25, y: -8 };
        pose.backArm = { x: -20, y: -20 };
        pose.itemAngle = model.state === "downStrongAttack" ? 0.58 : 0.92;
        pose.legSwing = -0.25;
      }
      if (model.state === "strongAttack") {
        pose.tilt = -0.18;
        pose.frontArm = { x: 30, y: -42 };
        pose.backArm = { x: -22, y: -22 };
        pose.itemAngle = -0.85;
      }
      if (model.state === "airAttack") {
        pose.tilt = 0.22;
        pose.legSwing = 0.9;
        pose.frontArm = { x: 24, y: -36 };
        pose.backArm = { x: -24, y: -33 };
        pose.itemAngle = 0.7;
      }
      if (model.state === "recovery") {
        pose.tilt = -0.04;
        pose.frontArm = { x: 10, y: -48 };
        pose.backArm = { x: -10, y: -45 };
        pose.legSwing = -0.35;
      }
      if (model.state === "hit") {
        pose.tilt = -0.24;
        pose.headX = -3;
        pose.frontArm = { x: 20, y: -17 };
        pose.backArm = { x: -20, y: -15 };
        pose.expression = "hit";
      }
      if (model.state === "guard") {
        pose.tilt = -0.08;
        pose.frontArm = { x: 18, y: -25 };
        pose.backArm = { x: -17, y: -24 };
        pose.itemAngle = -0.12;
      }
      if (model.state === "grab") {
        pose.tilt = 0.2;
        pose.frontArm = { x: 34, y: -25 };
        pose.backArm = { x: -10, y: -28 };
        pose.itemAngle = 0.08;
        pose.legSwing = 0.35;
      }
      if (model.state === "grabbed") {
        pose.tilt = -0.16;
        pose.frontArm = { x: 14, y: -18 };
        pose.backArm = { x: -14, y: -18 };
        pose.itemAngle = 0.4;
        pose.expression = "hit";
      }
      if (model.state === "ledge") {
        pose.tilt = 0.08;
        pose.frontArm = { x: 18, y: -42 };
        pose.backArm = { x: -10, y: -40 };
        pose.legSwing = -0.5;
        pose.itemAngle = -0.4;
      }
      if (model.state === "dodge") {
        pose.tilt = 0.32;
        pose.legSwing = 0.8;
        pose.frontArm = { x: 12, y: -34 };
        pose.backArm = { x: -22, y: -30 };
      }
      if (model.state === "skill") {
        pose.frontArm = { x: 24, y: -39 };
        pose.backArm = { x: -24, y: -37 };
        pose.itemAngle = -0.2;
        pose.expression = "happy";
      }
      if (model.state === "ultimate") {
        pose.tilt = Math.sin((model.time || 0) * 16) * 0.08;
        pose.frontArm = { x: 25, y: -50 };
        pose.backArm = { x: -25, y: -48 };
        pose.itemAngle = -0.9;
        pose.expression = "happy";
      }
      return pose;
    }

    static drawShadow(ctx, model, scale) {
      ctx.save();
      const airborne = model.state === "jump" || model.state === "fall" || model.state === "airAttack" || model.state === "recovery";
      ctx.globalAlpha *= airborne ? 0.28 : 0.42;
      ctx.fillStyle = "rgba(24, 33, 47, 0.28)";
      ctx.beginPath();
      ctx.ellipse(model.centerX, model.footY + 5 * scale, 24 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    static drawAura(ctx, model, scale) {
      if (model.happyBuffTimer <= 0 && model.skillTimer <= 0 && model.state !== "ultimate" && !model.isGuarding && model.dodgeTimer <= 0) return;
      ctx.save();
      const isHappy = model.character.id === "happy_repeat_student";
      const pulse = 0.55 + Math.sin(performance.now() / 90) * 0.18;
      ctx.globalAlpha *= pulse;
      if (model.isGuarding) {
        ctx.globalAlpha *= 0.88;
        ctx.fillStyle = "rgba(126, 211, 255, 0.18)";
        ctx.strokeStyle = "rgba(126, 211, 255, 0.88)";
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.ellipse(model.centerX, model.footY - 28 * scale, 32 * scale, 39 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }
      if (model.dodgeTimer > 0) {
        ctx.globalAlpha *= 0.62;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3 * scale;
        ctx.lineCap = "round";
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.moveTo(model.centerX - 22 * scale + i * 10 * scale, model.footY - 46 * scale + i * 5 * scale);
          ctx.lineTo(model.centerX - 42 * scale + i * 10 * scale, model.footY - 22 * scale + i * 4 * scale);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      ctx.strokeStyle = model.state === "ultimate" ? "#ffffff" : isHappy ? "#fff176" : model.character.appearance.accentColor;
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.arc(model.centerX, model.footY - 27 * scale, (model.state === "ultimate" ? 46 : 34) * scale, 0, Math.PI * 2);
      ctx.stroke();
      if (isHappy || model.state === "ultimate") {
        ctx.fillStyle = "#ffd23f";
        for (let i = 0; i < (model.state === "ultimate" ? 8 : 5); i += 1) {
          const angle = (performance.now() / 420) + i * Math.PI * 0.4;
          this.drawStar(ctx, model.centerX + Math.cos(angle) * 42 * scale, model.footY - 28 * scale + Math.sin(angle) * 32 * scale, 4 * scale);
        }
      }
      ctx.restore();
    }

    static drawLegs(ctx, appearance, pose, model) {
      const swing = pose.legSwing;
      const leftFoot = { x: -9 - swing * 4, y: -1 };
      const rightFoot = { x: 9 + swing * 4, y: -1 };
      if (model.state === "jump" || model.state === "fall" || model.state === "airAttack") {
        leftFoot.y = -6;
        rightFoot.y = -7;
      }
      this.drawLimb(ctx, -7, -15, leftFoot.x, leftFoot.y, model.playerColor, "#263238", 8, 5);
      this.drawLimb(ctx, 7, -15, rightFoot.x, rightFoot.y, model.playerColor, "#263238", 8, 5);
      ctx.fillStyle = "#1f2933";
      roundRect(ctx, leftFoot.x - 7, leftFoot.y - 3, 12, 6, 3);
      ctx.fill();
      roundRect(ctx, rightFoot.x - 5, rightFoot.y - 3, 12, 6, 3);
      ctx.fill();
    }

    static drawBackArm(ctx, appearance, pose, model) {
      this.drawArm(ctx, appearance, -10, -31, pose.backArm.x, pose.backArm.y, model, false);
    }

    static drawFrontArm(ctx, appearance, pose, model) {
      this.drawArm(ctx, appearance, 10, -31, pose.frontArm.x, pose.frontArm.y, model, true);
    }

    static drawArm(ctx, appearance, sx, sy, ex, ey, model, front) {
      const glove = this.getGloveColor(appearance);
      this.drawLimb(ctx, sx, sy, ex, ey, model.playerColor, appearance.outfitColor, 7, 4.5);
      ctx.fillStyle = glove;
      ctx.strokeStyle = model.playerColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ex, ey, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (front && ["attack", "strongAttack", "upAttack", "downAttack", "upStrongAttack", "downStrongAttack"].includes(model.state)) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = appearance.accentColor;
        ctx.lineWidth = model.state.includes("Strong") || model.state === "strongAttack" ? 4 : 2.5;
        ctx.beginPath();
        ctx.arc(ex + 5, ey, model.state.includes("Strong") || model.state === "strongAttack" ? 19 : 12, -0.8, 0.8);
        ctx.stroke();
        ctx.restore();
      }
    }

    static drawBody(ctx, appearance, pose, model) {
      ctx.save();
      ctx.fillStyle = model.hitFlashTimer > 0 ? "#ffffff" : appearance.outfitColor;
      ctx.strokeStyle = model.playerColor;
      ctx.lineWidth = 3;
      roundRect(ctx, -14, -39, 28, 30, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      roundRect(ctx, -9, -35, 18, 9, 5);
      ctx.fill();
      ctx.restore();
    }

    static drawCostume(ctx, appearance, model) {
      const type = appearance.costumeType;
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = appearance.accentColor;
      ctx.fillStyle = appearance.accentColor;

      if (["suit", "lawyer", "realtor", "accountant"].includes(type)) {
        ctx.fillStyle = "#f8f9fa";
        ctx.beginPath();
        ctx.moveTo(-8, -37);
        ctx.lineTo(0, -25);
        ctx.lineTo(8, -37);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.lineTo(4, -21);
        ctx.lineTo(0, -15);
        ctx.lineTo(-4, -21);
        ctx.closePath();
        ctx.fill();
      }

      if (type === "hoodie" || type === "student" || type === "education_student") {
        ctx.strokeStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(0, -12);
        ctx.moveTo(-6, -32);
        ctx.lineTo(-10, -28);
        ctx.moveTo(6, -32);
        ctx.lineTo(10, -28);
        ctx.stroke();
        if (type === "education_student") {
          ctx.fillStyle = "rgba(255,255,255,0.68)";
          roundRect(ctx, -12, -37, 24, 7, 4);
          ctx.fill();
          ctx.strokeStyle = appearance.accentColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-9, -21);
          ctx.lineTo(9, -21);
          ctx.stroke();
        }
      }

      if (["chef", "doctor", "nurse", "researcher"].includes(type)) {
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        roundRect(ctx, -12, -39, 24, 29, 6);
        ctx.fill();
        ctx.strokeStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -37);
        ctx.lineTo(0, -11);
        ctx.stroke();
        if (type === "doctor" || type === "nurse") this.drawCross(ctx, 8, -27, 4, appearance.accentColor);
      }

      if (type === "firefighter" || type === "construction") {
        ctx.strokeStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(-11, -27);
        ctx.lineTo(11, -27);
        ctx.moveTo(-9, -19);
        ctx.lineTo(9, -19);
        ctx.stroke();
      }

      if (type === "police" || type === "security") {
        ctx.fillStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.arc(0, -27, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1d1d1d";
        ctx.beginPath();
        ctx.moveTo(-12, -17);
        ctx.lineTo(12, -17);
        ctx.stroke();
      }

      if (type === "delivery") {
        ctx.fillStyle = appearance.accentColor;
        roundRect(ctx, -11, -34, 22, 11, 4);
        ctx.fill();
      }

      if (type === "barista" || type === "cleaner") {
        ctx.fillStyle = appearance.accentColor;
        roundRect(ctx, -10, -32, 20, 18, 5);
        ctx.fill();
      }

      if (type === "hairdresser") {
        ctx.strokeStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(-11, -34);
        ctx.lineTo(11, -34);
        ctx.moveTo(-9, -31);
        ctx.lineTo(9, -31);
        ctx.stroke();
      }

      if (type === "farmer") {
        ctx.strokeStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(-7, -37);
        ctx.lineTo(-7, -13);
        ctx.moveTo(7, -37);
        ctx.lineTo(7, -13);
        ctx.stroke();
      }

      if (type === "streamer") {
        ctx.fillStyle = appearance.accentColor;
        this.drawPlayIcon(ctx, 0, -25, 8);
      }
      ctx.restore();
    }

    static drawHead(ctx, appearance, pose, model) {
      ctx.save();
      ctx.fillStyle = appearance.skinColor;
      ctx.strokeStyle = model.playerColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pose.headX, -52 + pose.headY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    static drawHair(ctx, appearance, model) {
      ctx.save();
      const style = appearance.hairStyle;
      ctx.fillStyle = appearance.hairColor;
      if (style !== "covered" && style !== "cap") {
        ctx.beginPath();
        ctx.arc(0, -58, 12, Math.PI, Math.PI * 2);
        ctx.fill();
      }
      if (style === "messy" || style === "spiky") {
        for (let i = -2; i <= 2; i += 1) {
          ctx.beginPath();
          ctx.moveTo(i * 5, -66);
          ctx.lineTo(i * 5 + (style === "spiky" ? 3 : -2), -73 + Math.abs(i) * 2);
          ctx.lineTo(i * 5 + 5, -63);
          ctx.closePath();
          ctx.fill();
        }
      }
      if (style === "bob") {
        roundRect(ctx, -14, -61, 28, 18, 8);
        ctx.fill();
      }
      if (style === "stylish") {
        ctx.fillStyle = appearance.hairColor;
        ctx.beginPath();
        ctx.moveTo(-14, -57);
        ctx.bezierCurveTo(-7, -77, 17, -72, 14, -48);
        ctx.lineTo(2, -56);
        ctx.closePath();
        ctx.fill();
      }
      this.drawHeadwear(ctx, appearance);
      ctx.restore();
    }

    static drawHeadwear(ctx, appearance) {
      const accessory = appearance.accessory;
      if (accessory === "chef_hat") {
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, -11, -72, 22, 12, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-7, -72, 7, 0, Math.PI * 2);
        ctx.arc(0, -75, 8, 0, Math.PI * 2);
        ctx.arc(8, -72, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (["helmet"].includes(accessory)) {
        ctx.fillStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.arc(0, -59, 14, Math.PI, Math.PI * 2);
        ctx.lineTo(14, -56);
        ctx.lineTo(-14, -56);
        ctx.closePath();
        ctx.fill();
      }
      if (["police_cap", "security_cap", "cap"].includes(accessory) || appearance.hairStyle === "cap") {
        ctx.fillStyle = appearance.outfitColor;
        ctx.beginPath();
        ctx.arc(0, -61, 13, Math.PI, Math.PI * 2);
        ctx.lineTo(13, -57);
        ctx.lineTo(-13, -57);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = appearance.accentColor;
        roundRect(ctx, 2, -60, 16, 4, 2);
        ctx.fill();
      }
      if (accessory === "nurse_cap") {
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, -11, -70, 22, 8, 3);
        ctx.fill();
        this.drawCross(ctx, 0, -66, 4, appearance.accentColor);
      }
      if (accessory === "straw_hat") {
        ctx.fillStyle = "#d6a84f";
        roundRect(ctx, -18, -63, 36, 5, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -64, 11, Math.PI, Math.PI * 2);
        ctx.fill();
      }
      if (accessory === "goggles") {
        ctx.strokeStyle = appearance.accentColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-10, -60, 8, 5);
        ctx.strokeRect(2, -60, 8, 5);
        ctx.beginPath();
        ctx.moveTo(-2, -58);
        ctx.lineTo(2, -58);
        ctx.stroke();
      }
      if (["headphones", "headset"].includes(accessory)) {
        ctx.strokeStyle = appearance.accentColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -58, 16, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        ctx.fillStyle = appearance.accentColor;
        roundRect(ctx, -17, -57, 5, 11, 3);
        roundRect(ctx, 12, -57, 5, 11, 3);
        ctx.fill();
      }
    }

    static drawFace(ctx, appearance, pose, model) {
      ctx.save();
      ctx.fillStyle = "#18212f";
      const sleepy = model.character.id === "programmer";
      if (pose.expression === "hit") {
        ctx.beginPath();
        ctx.arc(-5, -53, 2.2, 0, Math.PI * 2);
        ctx.arc(6, -53, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#18212f";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -47, 3.5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        if (sleepy) {
          ctx.fillRect(-8, -54, 6, 1.5);
          ctx.fillRect(3, -54, 6, 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(-5, -54, 1.8, 0, Math.PI * 2);
          ctx.arc(6, -54, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = "#18212f";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
      if (model.character.id === "happy_repeat_student" || pose.expression === "happy") {
          ctx.arc(1, -49, 4, 0.05, Math.PI - 0.05);
        } else {
          ctx.moveTo(-3, -48);
          ctx.quadraticCurveTo(1, -46, 5, -48);
        }
        ctx.stroke();
      }
      if (["teacher", "accountant"].includes(model.character.id)) {
        ctx.strokeStyle = "#18212f";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-10, -57, 8, 5);
        ctx.strokeRect(2, -57, 8, 5);
        ctx.beginPath();
        ctx.moveTo(-2, -55);
        ctx.lineTo(2, -55);
        ctx.stroke();
      }
      if (appearance.accessory === "cigarette") {
        ctx.save();
        ctx.strokeStyle = "#f8f9fa";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(5, -49);
        ctx.lineTo(17, -52);
        ctx.stroke();
        ctx.fillStyle = "#f77f00";
        ctx.beginPath();
        ctx.arc(18, -52, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(230,230,230,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(19, -55);
        ctx.quadraticCurveTo(24, -60, 21, -65);
        ctx.moveTo(15, -56);
        ctx.quadraticCurveTo(19, -61, 16, -66);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    static drawHeldItem(ctx, appearance, pose, model) {
      const hand = pose.frontArm;
      this.drawWeapon(ctx, appearance.weaponType, hand.x + 5, hand.y, pose.itemAngle, appearance, model);
      if (appearance.accessory === "backpack" || appearance.secondaryAccessory === "backpack") {
        ctx.save();
        ctx.fillStyle = appearance.accentColor;
        ctx.strokeStyle = model.playerColor;
        ctx.lineWidth = 1.5;
        roundRect(ctx, -19, -35, 9, 22, 4);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      if (appearance.accessory === "delivery_bag") {
        ctx.save();
        ctx.fillStyle = appearance.accentColor;
        roundRect(ctx, -20, -33, 10, 18, 4);
        ctx.fill();
        ctx.restore();
      }
      if (appearance.accessory === "badge" || appearance.accessory === "house_badge") {
        ctx.save();
        ctx.fillStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.arc(8, -30, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    static drawPoseEffects(ctx, appearance, pose, model) {
      if (model.state === "recovery") {
        ctx.save();
        ctx.strokeStyle = appearance.accentColor;
        ctx.lineWidth = 2;
        for (let i = -1; i <= 1; i += 1) {
          ctx.beginPath();
          ctx.moveTo(i * 8, -6);
          ctx.lineTo(i * 8, -25);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (model.state === "airAttack") {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -31, 28, -0.8, Math.PI * 1.3);
        ctx.stroke();
        ctx.restore();
      }
      if (model.state === "strongAttack") {
        ctx.save();
        ctx.fillStyle = appearance.accentColor;
        ctx.globalAlpha = 0.7;
        if (model.character.id === "happy_repeat_student") {
          ctx.font = "900 15px sans-serif";
          ctx.fillText("実習", 25, -48);
        } else if (model.character.id === "police") {
          ctx.font = "900 11px sans-serif";
          ctx.fillText("STOP", 26, -47);
        }
        ctx.restore();
      }
    }

    static drawWeapon(ctx, type, x, y, angle, appearance, model) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = "#18212f";
      ctx.lineWidth = 2;
      ctx.fillStyle = appearance.accentColor;

      if (type === "lesson_plan" && model.state === "strongAttack") {
        type = "training_diary";
      }

      if (["paper", "card", "evidence", "report", "lesson_plan"].includes(type)) {
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, -3, -8, 18, 14, 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = type === "lesson_plan" || type === "report" ? "#e63946" : appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(11, -2);
        ctx.moveTo(0, 2);
        ctx.lineTo(9, 2);
        if (type === "lesson_plan") {
          ctx.moveTo(9, -6);
          ctx.lineTo(12, -3);
          ctx.lineTo(17, -9);
          ctx.fillStyle = "#ffd23f";
          roundRect(ctx, 12, 2, 7, 5, 1);
          ctx.fill();
        }
        ctx.stroke();
      } else if (type === "training_diary") {
        ctx.fillStyle = "#f8f1df";
        roundRect(ctx, -4, -12, 22, 21, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#3399ff";
        roundRect(ctx, -4, -12, 22, 5, 2);
        ctx.fill();
        ctx.strokeStyle = "#e63946";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(13, -2);
        ctx.moveTo(0, 4);
        ctx.lineTo(11, 4);
        ctx.stroke();
        ctx.fillStyle = "#e63946";
        ctx.font = "900 7px sans-serif";
        ctx.fillText("実", 6, -6);
      } else if (type === "keyboard") {
        ctx.fillStyle = "#263238";
        roundRect(ctx, -2, -6, 22, 10, 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = appearance.accentColor;
        for (let i = 0; i < 4; i += 1) ctx.fillRect(1 + i * 4, -3, 2, 2);
      } else if (type === "pan") {
        ctx.fillStyle = "#202020";
        ctx.beginPath();
        ctx.ellipse(7, -2, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(-16, 1);
        ctx.stroke();
      } else if (type === "stethoscope") {
        ctx.strokeStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.arc(4, -2, 8, 0.2, Math.PI * 1.4);
        ctx.stroke();
        ctx.fillStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.arc(12, -2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === "bandage") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.bezierCurveTo(8, -12, 16, 8, 28, 0);
        ctx.stroke();
      } else if (type === "chalk") {
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, -1, -3, 18, 5, 3);
        ctx.fill();
        ctx.stroke();
      } else if (type === "hose") {
        ctx.strokeStyle = "#4dabf7";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-8, 3);
        ctx.bezierCurveTo(4, -6, 18, -4, 26, -10);
        ctx.stroke();
      } else if (type === "baton") {
        ctx.strokeStyle = "#202020";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-5, 4);
        ctx.lineTo(18, -9);
        ctx.stroke();
      } else if (type === "hammer") {
        ctx.strokeStyle = "#5d4037";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-5, 6);
        ctx.lineTo(12, -12);
        ctx.stroke();
        ctx.fillStyle = "#6c757d";
        roundRect(ctx, 7, -17, 18, 8, 2);
        ctx.fill();
        ctx.stroke();
      } else if (type === "box") {
        ctx.fillStyle = "#c79045";
        roundRect(ctx, -2, -8, 18, 16, 3);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#8d5a23";
        ctx.beginPath();
        ctx.moveTo(7, -8);
        ctx.lineTo(7, 8);
        ctx.stroke();
      } else if (type === "cup") {
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, 0, -8, 14, 14, 3);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#8d6e63";
        ctx.beginPath();
        ctx.moveTo(3, -11);
        ctx.quadraticCurveTo(6, -17, 9, -11);
        ctx.stroke();
      } else if (type === "scissors") {
        ctx.strokeStyle = "#dfe6e9";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, -9);
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-2, -3, 3, 0, Math.PI * 2);
        ctx.arc(-2, 4, 3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === "carrot") {
        ctx.fillStyle = "#f77f00";
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(18, 0);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#6a994e";
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-5, -12);
        ctx.moveTo(0, 0);
        ctx.lineTo(-7, -4);
        ctx.stroke();
      } else if (type === "flask") {
        ctx.fillStyle = "rgba(67, 170, 139, 0.78)";
        ctx.beginPath();
        ctx.moveTo(3, -10);
        ctx.lineTo(10, -10);
        ctx.lineTo(10, -3);
        ctx.quadraticCurveTo(18, 8, 6, 9);
        ctx.quadraticCurveTo(-6, 8, 3, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (type === "flashlight") {
        ctx.fillStyle = "#444";
        roundRect(ctx, -2, -5, 20, 9, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 241, 118, 0.65)";
        ctx.beginPath();
        ctx.moveTo(18, -5);
        ctx.lineTo(34, -15);
        ctx.lineTo(34, 8);
        ctx.closePath();
        ctx.fill();
      } else if (type === "mop") {
        ctx.strokeStyle = "#8d6e63";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, -12);
        ctx.lineTo(18, 9);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.moveTo(17, 8);
          ctx.lineTo(23 + i * 2, 15 - i);
          ctx.stroke();
        }
      } else if (type === "key") {
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(2, 0, 4, 0, Math.PI * 2);
        ctx.moveTo(6, 0);
        ctx.lineTo(22, 0);
        ctx.lineTo(22, 5);
        ctx.moveTo(16, 0);
        ctx.lineTo(16, 4);
        ctx.stroke();
      } else if (type === "mic") {
        ctx.fillStyle = "#222";
        roundRect(ctx, 0, -12, 10, 16, 5);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = appearance.accentColor;
        ctx.beginPath();
        ctx.moveTo(5, 4);
        ctx.lineTo(15, 14);
        ctx.stroke();
      } else if (type === "calculator") {
        ctx.fillStyle = "#e9ecef";
        roundRect(ctx, 0, -11, 14, 18, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = appearance.accentColor;
        for (let row = 0; row < 2; row += 1) {
          for (let col = 0; col < 2; col += 1) ctx.fillRect(3 + col * 5, -3 + row * 5, 3, 3);
        }
      }
      ctx.restore();
    }

    static drawPlayerLabel(ctx, model) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "900 13px sans-serif";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.strokeText(`P${model.playerNumber}`, model.centerX, model.footY - 70);
      ctx.fillStyle = model.playerColor;
      ctx.fillText(`P${model.playerNumber}`, model.centerX, model.footY - 70);
      ctx.font = "800 11px sans-serif";
      ctx.strokeText(model.name, model.centerX, model.footY - 56);
      ctx.fillStyle = "#18212f";
      ctx.fillText(model.name, model.centerX, model.footY - 56);
      if (model.speechTimer > 0 && model.speechText) {
        ctx.font = "900 15px sans-serif";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.strokeText(model.speechText, model.centerX, model.footY - 88);
        ctx.fillStyle = model.character.id === "happy_repeat_student" ? "#a56b00" : "#0d7c72";
        ctx.fillText(model.speechText, model.centerX, model.footY - 88);
      }
      ctx.restore();
    }

    static drawLimb(ctx, sx, sy, ex, ey, outline, fill, outlineWidth, fillWidth) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = outline;
      ctx.lineWidth = outlineWidth;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.strokeStyle = fill;
      ctx.lineWidth = fillWidth;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    }

    static drawCross(ctx, x, y, size, color) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      ctx.restore();
    }

    static drawPlayIcon(ctx, x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.45, y - size * 0.6);
      ctx.lineTo(x + size * 0.55, y);
      ctx.lineTo(x - size * 0.45, y + size * 0.6);
      ctx.closePath();
      ctx.fill();
    }

    static drawStar(ctx, x, y, radius) {
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const angle = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 === 0 ? radius : radius * 0.45;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    static getGloveColor(appearance) {
      if (["police", "nurse", "doctor", "chef", "researcher", "cleaner"].includes(appearance.costumeType)) return "#ffffff";
      return appearance.skinColor;
    }
  }

  class HUDRenderer {
    static drawBattleHUD(ctx, players, game) {
      const activePlayers = players.length > 0 ? players : [];
      if (activePlayers.length === 0) return;
      const hudHeight = 92;
      const hudY = H - hudHeight;
      const panelWidth = W / activePlayers.length;
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(0, hudY - 8, W, hudHeight + 8);
      activePlayers.forEach((player, index) => {
        this.drawPlayerPanel(ctx, player, index * panelWidth, hudY, panelWidth, hudHeight, game);
      });
      ctx.restore();
    }

    static drawPlayerPanel(ctx, player, x, y, width, height, game) {
      const eliminated = player.eliminated || player.stocks <= 0;
      const pad = 9;
      const panelX = x + 6;
      const panelW = width - 12;
      ctx.save();
      ctx.globalAlpha = eliminated ? 0.62 : 1;
      ctx.fillStyle = eliminated ? "rgba(12, 15, 22, 0.82)" : "rgba(12, 15, 22, 0.74)";
      ctx.strokeStyle = player.playerColor || player.color;
      ctx.lineWidth = 3;
      roundRect(ctx, panelX, y + 7, panelW, height - 13, 8);
      ctx.fill();
      ctx.stroke();

      const controller = player.controllerType === "cpu" ? "CPU" : player.controllerType === "online" ? "Online" : "";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "900 14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`P${player.playerNumber}${controller ? ` ${controller}` : ""}`, panelX + pad, y + 26);

      ctx.font = "800 12px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      const maxNameWidth = Math.max(70, panelW - 112);
      this.drawFittedText(ctx, player.name, panelX + pad, y + 45, maxNameWidth, 12);
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.58)";
      this.drawFittedText(ctx, player.job, panelX + pad, y + 62, maxNameWidth, 11);

      ctx.textAlign = "right";
      if (eliminated) {
        ctx.fillStyle = "#ff6f61";
        ctx.font = "950 28px sans-serif";
        ctx.fillText("OUT", panelX + panelW - pad, y + 49);
      } else {
        const damage = Math.round(player.damage);
        const dangerPulse = damage >= 150 ? Math.sin((game?.lastTime ?? performance.now()) / 70) * 2 : 0;
        const fontSize = damage >= 150 ? 34 + dangerPulse : damage >= 100 ? 31 : 29;
        ctx.fillStyle = getDamageColor(damage);
        ctx.font = `950 ${fontSize}px sans-serif`;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.72)";
        const damageText = `${damage}%`;
        ctx.strokeText(damageText, panelX + panelW - pad, y + 49);
        ctx.fillText(damageText, panelX + panelW - pad, y + 49);
      }

      ctx.font = "800 11px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.fillText(`Stocks: ${Math.max(0, player.stocks)}`, panelX + panelW - pad, y + 69);
      ctx.fillStyle = this.getStatusColor(player);
      this.drawFittedTextRight(ctx, `${this.getStatusText(player)} / ${this.getUltimateStatusText(player)} / Guard ${this.getGuardStatusText(player)}`, panelX + panelW - pad, y + 83, Math.max(84, panelW - 18), 11);
      ctx.restore();
    }

    static drawFittedText(ctx, text, x, y, maxWidth, fontSize) {
      let size = fontSize;
      while (size > 9 && ctx.measureText(text).width > maxWidth) {
        size -= 1;
        ctx.font = ctx.font.replace(/\d+px/, `${size}px`);
      }
      ctx.fillText(text, x, y);
    }

    static drawFittedTextRight(ctx, text, x, y, maxWidth, fontSize) {
      let size = fontSize;
      while (size > 9 && ctx.measureText(text).width > maxWidth) {
        size -= 1;
        ctx.font = ctx.font.replace(/\d+px/, `${size}px`);
      }
      ctx.fillText(text, x, y);
    }

    static getStatusText(player) {
      if (player.eliminated || player.stocks <= 0) return "脱落";
      if (player.guardBreakTimer > 0) return "ガードブレイク";
      if (player.grabbedBy) return "拘束中";
      if (player.grabbedTarget) return "つかみ中";
      if (player.ledgeHangTimer > 0) return "崖つかまり";
      if (player.isChargingSmash) return "スマッシュため";
      if (player.dodgeTimer > 0) return "緊急回避";
      if (player.isGuarding) return "ガード中";
      if (player.isUsingUltimate) return "ULT発動中";
      if (player.happyBuffTimer > 0) return "逆境メンタル発動中";
      if (player.happyStallTimer > 0) return "実習日誌確認中";
      if (player.barrierTimer > 0) return "バリア発動中";
      if (player.buzzTimer > 0) return "特殊能力発動中";
      if (player.skillCooldownTimer <= 0) return "Skill OK";
      return `Skill ${player.skillCooldownTimer.toFixed(1)}s`;
    }

    static getUltimateStatusText(player) {
      if (player.eliminated || player.stocks <= 0) return "ULT --";
      if (player.isUsingUltimate) return "ULT NOW";
      if (player.ultimateCooldownTimer <= 0) return "ULT OK";
      return `ULT ${Math.ceil(player.ultimateCooldownTimer)}s`;
    }

    static getGuardStatusText(player) {
      if (player.eliminated || player.stocks <= 0) return "--";
      if (player.guardBreakTimer > 0) return "BREAK";
      return `${Math.round(player.guardMeter)}%`;
    }

    static getStatusColor(player) {
      if (player.eliminated || player.stocks <= 0) return "rgba(255,111,97,0.88)";
      if (player.grabbedBy || player.grabbedTarget) return "#ffca3a";
      if (player.guardBreakTimer > 0) return "#ff5a5f";
      if (player.isGuarding || player.dodgeTimer > 0) return "#7ed3ff";
      if (player.isUsingUltimate || player.ultimateCooldownTimer <= 0) return "#ffdd44";
      if (player.happyBuffTimer > 0 || player.barrierTimer > 0 || player.buzzTimer > 0) return "#ffdd44";
      if (player.skillCooldownTimer <= 0) return "#7ac943";
      return "rgba(255,255,255,0.7)";
    }
  }

  class Player {
    constructor(id, character, x, y, color, stocks = STARTING_STOCKS) {
      this.id = id;
      this.playerNumber = id + 1;
      this.selectedCharacter = character;
      this.name = character.name;
      this.job = character.job;
      this.x = x;
      this.y = y;
      this.prevX = x;
      this.prevY = y;
      this.width = PLAYER_W;
      this.height = PLAYER_H;
      this.hitboxWidth = PLAYER_W;
      this.hitboxHeight = PLAYER_H;
      this.drawWidth = PLAYER_DRAW_W;
      this.drawHeight = PLAYER_DRAW_H;
      this.vx = 0;
      this.vy = 0;
      this.speed = character.speed;
      this.jumpPower = character.jumpPower;
      this.weight = character.weight;
      this.onGround = false;
      this.platformStandingOn = null;
      this.facing = id % 2 === 0 ? 1 : -1;
      this.damage = 0;
      this.stocks = stocks;
      this.color = color;
      this.playerColor = color;
      this.attackCooldown = 0;
      this.skillCooldown = 0;
      this.skillCooldownTimer = 0;
      this.hitStun = 0;
      this.hitStopTimer = 0;
      this.invincibleTimer = 1;
      this.eliminated = false;
      this.hitFlashTimer = 0;
      this.speechText = "";
      this.speechTimer = 0;
      this.lastHitLabel = "";
      this.state = "idle";
      this.visualState = "idle";
      this.visualStateTimer = 0;
      this.skillPoseTimer = 0;
      this.animationTime = 0;
      this.slowTimer = 0;
      this.controlGlitchTimer = 0;
      this.slipTimer = 0;
      this.barrierTimer = 0;
      this.counterTimer = 0;
      this.speedBoostTimer = 0;
      this.speedBoostMultiplier = 1;
      this.stageSpeedBoostTimer = 0;
      this.stageSpeedBoostMultiplier = 1;
      this.jumpBoostTimer = 0;
      this.jumpBoostMultiplier = 1;
      this.buzzTimer = 0;
      this.happyBuffTimer = 0;
      this.happySpeedMultiplier = 1;
      this.happyAttackMultiplier = 1;
      this.happyKnockbackMultiplier = 1;
      this.happyStallTimer = 0;
      this.guardMeter = 100;
      this.isGuarding = false;
      this.guardJustTimer = 0;
      this.guardBreakTimer = 0;
      this.dodgeTimer = 0;
      this.dodgeCooldownTimer = 0;
      this.dodgeEndlagTimer = 0;
      this.dodgeDirection = "neutral";
      this.grabCooldownTimer = 0;
      this.grabTimer = 0;
      this.grabbedTarget = null;
      this.grabbedBy = null;
      this.grabbedTimer = 0;
      this.ledgeHangTimer = 0;
      this.ledgeCooldownTimer = 0;
      this.ledgeSide = "";
      this.ledgePlatform = null;
      this.isChargingSmash = false;
      this.smashChargeTimer = 0;
      this.smashChargeAttackType = "strongAttack";
      this.smashChargePower = 1;
      this.smashChargeKnockback = 1;
      this.maxAirJumps = 1;
      this.airJumpsRemaining = this.maxAirJumps;
      this.hasUsedRecovery = false;
      this.ultimateCooldownTimer = 0;
      this.isUsingUltimate = false;
      this.ultimateTimer = 0;
      this.ultimatePhase = "";
      this.lastAttackType = "";
      this.lastAttackDirection = "";
      this.lastAttackDebugTimer = 0;
      this.lastInput = createEmptyInput();
      this.controllerType = id === 0 ? "local" : "cpu";
    }

    getRect() {
      return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    get centerX() {
      return this.x + this.width / 2;
    }

    get centerY() {
      return this.y + this.height / 2;
    }

    setSpeech(text, duration = 0.8) {
      this.speechText = text;
      this.speechTimer = duration;
    }

    setVisualState(state, duration = 0.25) {
      this.visualState = state;
      this.visualStateTimer = duration;
      this.state = state;
      if (state === "skill") this.skillPoseTimer = Math.max(this.skillPoseTimer, duration);
    }

    updateVisualState(input) {
      if (this.visualStateTimer > 0) {
        this.state = this.visualState;
        return;
      }
      if (this.guardBreakTimer > 0) {
        this.state = "hit";
      } else if (this.grabbedBy) {
        this.state = "grabbed";
      } else if (this.grabbedTarget) {
        this.state = "grab";
      } else if (this.ledgeHangTimer > 0) {
        this.state = "ledge";
      } else if (this.dodgeTimer > 0) {
        this.state = "dodge";
      } else if (this.isGuarding) {
        this.state = "guard";
      } else if (this.hitStun > 0 || this.hitFlashTimer > 0) {
        this.state = "hit";
      } else if (this.isUsingUltimate) {
        this.state = "ultimate";
      } else if (this.skillPoseTimer > 0 || this.happyBuffTimer > 0) {
        this.state = "skill";
      } else if (!this.onGround) {
        if ((input?.normalPressed || input?.strongPressed) && this.attackCooldown > 0) this.state = "airAttack";
        else this.state = this.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(this.vx) > 0.8) {
        this.state = "run";
      } else {
        this.state = "idle";
      }
    }

    getSpeedMultiplier() {
      let multiplier = 1;
      if (this.speedBoostTimer > 0) multiplier *= this.speedBoostMultiplier;
      if (this.stageSpeedBoostTimer > 0) multiplier *= this.stageSpeedBoostMultiplier;
      if (this.happyBuffTimer > 0) multiplier *= this.happySpeedMultiplier;
      if (this.slowTimer > 0) multiplier *= 0.55;
      if (this.happyStallTimer > 0) multiplier *= 0.25;
      return clamp(multiplier, 0.22, 1.65);
    }

    getAttackMultiplier() {
      let multiplier = 1;
      if (this.buzzTimer > 0) multiplier *= 1.18;
      if (this.happyBuffTimer > 0) multiplier *= this.happyAttackMultiplier;
      return clamp(multiplier, 0.7, 1.45);
    }

    getKnockbackMultiplier() {
      let multiplier = 1;
      if (this.buzzTimer > 0) multiplier *= 1.16;
      if (this.happyBuffTimer > 0) multiplier *= this.happyKnockbackMultiplier;
      return clamp(multiplier, 0.7, 1.55);
    }

    updateTimers(dt, game = null) {
      const beforeHappy = this.happyBuffTimer;
      const beforeUltimateCooldown = this.ultimateCooldownTimer;
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.skillCooldownTimer = Math.max(0, this.skillCooldownTimer - dt);
      this.ultimateCooldownTimer = Math.max(0, this.ultimateCooldownTimer - dt);
      this.hitStopTimer = Math.max(0, this.hitStopTimer - dt);
      this.hitStun = Math.max(0, this.hitStun - dt);
      this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
      this.visualStateTimer = Math.max(0, this.visualStateTimer - dt);
      this.skillPoseTimer = Math.max(0, this.skillPoseTimer - dt);
      this.speechTimer = Math.max(0, this.speechTimer - dt);
      this.slowTimer = Math.max(0, this.slowTimer - dt);
      this.controlGlitchTimer = Math.max(0, this.controlGlitchTimer - dt);
      this.slipTimer = Math.max(0, this.slipTimer - dt);
      this.barrierTimer = Math.max(0, this.barrierTimer - dt);
      this.counterTimer = Math.max(0, this.counterTimer - dt);
      this.speedBoostTimer = Math.max(0, this.speedBoostTimer - dt);
      this.stageSpeedBoostTimer = Math.max(0, this.stageSpeedBoostTimer - dt);
      this.jumpBoostTimer = Math.max(0, this.jumpBoostTimer - dt);
      this.buzzTimer = Math.max(0, this.buzzTimer - dt);
      this.happyBuffTimer = Math.max(0, this.happyBuffTimer - dt);
      this.happyStallTimer = Math.max(0, this.happyStallTimer - dt);
      this.lastAttackDebugTimer = Math.max(0, this.lastAttackDebugTimer - dt);
      this.guardJustTimer = Math.max(0, this.guardJustTimer - dt);
      this.guardBreakTimer = Math.max(0, this.guardBreakTimer - dt);
      this.dodgeTimer = Math.max(0, this.dodgeTimer - dt);
      this.dodgeCooldownTimer = Math.max(0, this.dodgeCooldownTimer - dt);
      this.dodgeEndlagTimer = Math.max(0, this.dodgeEndlagTimer - dt);
      this.grabCooldownTimer = Math.max(0, this.grabCooldownTimer - dt);
      this.grabTimer = Math.max(0, this.grabTimer - dt);
      this.grabbedTimer = Math.max(0, this.grabbedTimer - dt);
      this.ledgeHangTimer = Math.max(0, this.ledgeHangTimer - dt);
      this.ledgeCooldownTimer = Math.max(0, this.ledgeCooldownTimer - dt);
      if (!this.isGuarding && this.guardBreakTimer <= 0 && this.dodgeTimer <= 0) {
        this.guardMeter = Math.min(100, this.guardMeter + dt * 19);
      }

      if (beforeHappy > 0 && this.happyBuffTimer === 0) {
        this.happySpeedMultiplier = 1;
        this.happyAttackMultiplier = 1;
        this.happyKnockbackMultiplier = 1;
        this.happyStallTimer = 0.4;
        this.setSpeech("実習日誌確認中...", 0.75);
      }

      if (beforeUltimateCooldown > 0 && this.ultimateCooldownTimer === 0 && !this.eliminated && game) {
        game.spawnText(`P${this.playerNumber} 必殺技 READY!`, this.centerX, this.y - 34, "#ffd23f", 1.1, 22);
      }

      if (!this.isUsingUltimate) return;
      this.ultimateTimer = Math.max(0, this.ultimateTimer - dt);
      if (this.ultimateTimer > 0) return;

      if (this.ultimatePhase === "startup") {
        this.ultimatePhase = "active";
        this.ultimateTimer = this.selectedCharacter.ultimate.active;
        if (game) this.activateUltimate(game);
        return;
      }

      if (this.ultimatePhase === "active") {
        this.ultimatePhase = "endlag";
        this.ultimateTimer = this.selectedCharacter.ultimate.endlag;
        this.setSpeech("体勢立て直し中...", 0.5);
        return;
      }

      this.isUsingUltimate = false;
      this.ultimatePhase = "";
      this.ultimateTimer = 0;
    }

    update(dt, game) {
      this.updateTimers(dt, game);
      this.animationTime += dt;
      if (this.eliminated) return;

      const step = dt * 60;
      const input = game.getPlayerInput(this.id);
      this.lastInput = normalizeInput(input);

      if (this.hitStopTimer > 0) {
        this.updateHeldTargetPosition();
        this.updateVisualState(input);
        return;
      }

      if (this.grabbedBy) {
        this.vx = 0;
        this.vy = 0;
        this.updateVisualState(input);
        return;
      }

      if (this.ledgeHangTimer > 0) {
        this.handleLedgeInput(game, input);
        this.updateVisualState(input);
        return;
      }

      let actionLocked = false;
      if (this.grabbedTarget) {
        this.updateHeldTargetPosition();
        this.handleThrowInput(game, input);
        actionLocked = true;
      }
      if (this.isChargingSmash) {
        this.handleSmashCharge(game, input, dt);
        actionLocked = true;
      }

      this.prevX = this.x;
      this.prevY = this.y;
      this.onGround = false;
      this.platformStandingOn = null;
      const wasGuarding = this.isGuarding;
      this.isGuarding = false;

      const canAct = this.hitStun <= 0 && this.happyStallTimer <= 0 && !this.isUsingUltimate && this.dodgeTimer <= 0 && this.dodgeEndlagTimer <= 0 && this.guardBreakTimer <= 0 && !this.grabbedTarget && !actionLocked;

      if (canAct) {
        let move = input.moveX;
        if (this.controlGlitchTimer > 0) move *= -1;
        if (move !== 0) this.facing = move > 0 ? 1 : -1;

        const effectiveSpeed = this.speed * this.getSpeedMultiplier();
        const approach = clamp((this.slipTimer > 0 ? 0.06 : 0.24) * step, 0, 1);
        const wantsGuard = input.guardHeld && this.guardMeter > 0 && this.guardBreakTimer <= 0;
        if (input.dodgePressed && this.tryDodge(game, input)) {
          // Dodge consumes this frame's action.
        } else if (wantsGuard) {
          this.holdGuard(game, move, step, wasGuarding);
        } else if (move !== 0) {
          this.vx += (move * effectiveSpeed - this.vx) * approach;
        } else {
          this.vx *= Math.pow(this.onGround ? 0.82 : 0.96, step);
        }

        if (!this.isGuarding && this.dodgeTimer <= 0) {
          if (input.jumpPressed) this.tryJump(game);

          if (input.grabPressed) this.tryGrab(game);
          if (input.normalPressed) this.handleAttackInput(game, "normal", input);
          if (input.strongPressed) {
            if (this.onGround && input.strongHeld && this.attackCooldown <= 0) this.startSmashCharge(input);
            else this.handleAttackInput(game, "strong", input);
          }
          if (input.skillPressed) this.useSkill(game);
          if (input.ultimatePressed) this.tryUseUltimate(game);
        }
      } else {
        if (this.dodgeTimer <= 0) this.vx *= Math.pow(0.985, step);
      }

      this.vy = clamp(this.vy + GRAVITY * step, -22, MAX_FALL_SPEED);
      this.x += this.vx * step;
      this.y += this.vy * step;

      for (const platform of game.platforms) {
        resolvePlatformCollision(this, platform);
      }
      if (!this.onGround) this.tryGrabLedge(game);
      this.wasGrounded = this.onGround;
      this.updateVisualState(input);

      if (this.x < BLAST_ZONE.left || this.x > BLAST_ZONE.right || this.y > BLAST_ZONE.bottom || this.y < BLAST_ZONE.top) {
        game.handleKO(this);
      }
    }

    tryGrabLedge(game) {
      if (this.ledgeCooldownTimer > 0 || this.hitStun > 0 || this.dodgeTimer > 0 || this.grabbedBy || this.grabbedTarget) return false;
      if (this.vy < -5.5) return false;
      for (const platform of game.platforms) {
        if (platform.temporary || platform.lifetime <= 0) continue;
        const rect = platform.getRect();
        const nearY = this.y + this.height > rect.y - 18 && this.y < rect.y + 34;
        if (!nearY) continue;
        const leftDistance = Math.abs(this.centerX - rect.x);
        const rightDistance = Math.abs(this.centerX - (rect.x + rect.width));
        const side = leftDistance < rightDistance ? "left" : "right";
        const edgeX = side === "left" ? rect.x : rect.x + rect.width;
        const edgeDistance = Math.min(leftDistance, rightDistance);
        if (edgeDistance > 22) continue;
        if (side === "left" && this.centerX > rect.x + 26) continue;
        if (side === "right" && this.centerX < rect.x + rect.width - 26) continue;

        this.ledgeHangTimer = 1.65;
        this.ledgeCooldownTimer = 0.25;
        this.ledgeSide = side;
        this.ledgePlatform = platform;
        this.facing = side === "left" ? 1 : -1;
        this.x = side === "left" ? edgeX - this.width + 8 : edgeX - 8;
        this.y = rect.y - this.height + 14;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.airJumpsRemaining = this.maxAirJumps;
        this.hasUsedRecovery = false;
        this.invincibleTimer = Math.max(this.invincibleTimer, 0.38);
        this.setVisualState("ledge", 0.18);
        game.spawnText("崖つかまり", this.centerX, this.y - 10, "#7ed3ff", 0.42, 14);
        return true;
      }
      return false;
    }

    handleLedgeInput(game, input) {
      const platform = this.ledgePlatform;
      if (!platform || platform.lifetime <= 0) {
        this.dropFromLedge();
        return;
      }
      const towardStage = this.ledgeSide === "left" ? 1 : -1;
      const awayFromStage = -towardStage;
      this.facing = towardStage;
      this.vx = 0;
      this.vy = 0;
      const rect = platform.getRect();
      const edgeX = this.ledgeSide === "left" ? rect.x : rect.x + rect.width;
      this.x = this.ledgeSide === "left" ? edgeX - this.width + 8 : edgeX - 8;
      this.y = rect.y - this.height + 14;
      this.prevX = this.x;
      this.prevY = this.y;

      if (input.down || Math.sign(input.moveX) === awayFromStage) {
        this.dropFromLedge();
        return;
      }
      if (input.normalPressed || input.strongPressed || input.grabPressed) {
        this.ledgeAttack(game);
        return;
      }
      if (input.jumpPressed || input.up) {
        this.ledgeJump();
        return;
      }
      if (Math.sign(input.moveX) === towardStage || this.ledgeHangTimer <= 0) {
        this.ledgeClimb();
      }
    }

    finishLedgeAction() {
      this.ledgeHangTimer = 0;
      this.ledgeCooldownTimer = 0.48;
      this.ledgePlatform = null;
      this.ledgeSide = "";
    }

    ledgeClimb() {
      const platform = this.ledgePlatform;
      if (!platform) return;
      const rect = platform.getRect();
      const towardStage = this.ledgeSide === "left" ? 1 : -1;
      this.x = this.ledgeSide === "left" ? rect.x + 10 : rect.x + rect.width - this.width - 10;
      this.y = rect.y - this.height - 1;
      this.vx = towardStage * 2.8;
      this.vy = -1.2;
      this.onGround = true;
      this.invincibleTimer = Math.max(this.invincibleTimer, 0.18);
      this.setVisualState("dodge", 0.22);
      this.finishLedgeAction();
    }

    ledgeJump() {
      const towardStage = this.ledgeSide === "left" ? 1 : -1;
      this.vx = towardStage * 4.4;
      this.vy = -this.jumpPower * 0.78;
      this.invincibleTimer = Math.max(this.invincibleTimer, 0.16);
      this.setVisualState("jump", 0.24);
      this.finishLedgeAction();
    }

    ledgeAttack(game) {
      const towardStage = this.ledgeSide === "left" ? 1 : -1;
      const platform = this.ledgePlatform;
      if (platform) {
        const rect = platform.getRect();
        this.x = this.ledgeSide === "left" ? rect.x + 6 : rect.x + rect.width - this.width - 6;
        this.y = rect.y - this.height - 1;
      }
      this.facing = towardStage;
      this.vx = towardStage * 2.2;
      this.vy = -1.4;
      this.attackCooldown = Math.max(this.attackCooldown, 0.45);
      this.setVisualState("attack", 0.28);
      game.hitboxes.push(new AttackHitbox({
        owner: this,
        offsetX: towardStage > 0 ? this.width - 2 : -58,
        offsetY: 8,
        width: 62,
        height: 34,
        damage: 6 * this.getAttackMultiplier(),
        baseKnockback: 5.8 * this.getKnockbackMultiplier(),
        damageScale: ATTACK_DATA.normalAttack.damageScale,
        duration: 0.16,
        startup: 0.04,
        color: "rgba(126, 211, 255, 0.5)",
        label: "崖攻撃！",
        angle: Math.atan2(-0.25, towardStage)
      }));
      this.finishLedgeAction();
    }

    dropFromLedge() {
      const awayFromStage = this.ledgeSide === "left" ? -1 : 1;
      this.vx = awayFromStage * 2.8;
      this.vy = 2.2;
      this.setVisualState("fall", 0.18);
      this.finishLedgeAction();
    }

    tryGrab(game) {
      if (this.grabCooldownTimer > 0 || this.attackCooldown > 0 || this.grabbedTarget || this.grabbedBy) return false;
      const reach = this.onGround ? 42 : 34;
      const grabRect = {
        x: this.facing > 0 ? this.x + this.width - 2 : this.x - reach + 2,
        y: this.y + 6,
        width: reach,
        height: this.height - 8
      };

      this.grabCooldownTimer = 0.55;
      this.attackCooldown = Math.max(this.attackCooldown, 0.28);
      this.setVisualState("grab", 0.22);
      this.lastAttackType = "grab";
      this.lastAttackDirection = "grab";
      this.lastAttackDebugTimer = 1.1;
      game.spawnCharacterAttackEffect(this, "grab", {
        label: "つかみ",
        width: reach,
        height: this.height - 8,
        offsetX: grabRect.x - this.x,
        offsetY: 6,
        duration: 0.18,
        color: "rgba(126, 211, 255, 0.46)",
        attackDirection: "grab"
      });

      let best = null;
      let bestDistance = Infinity;
      for (const target of game.players) {
        if (target === this || target.eliminated || target.invincibleTimer > 0 || target.grabbedBy) continue;
        if (!rectsOverlap(grabRect, target.getRect())) continue;
        const distance = Math.abs(target.centerX - this.centerX);
        if (distance < bestDistance) {
          best = target;
          bestDistance = distance;
        }
      }

      if (!best) {
        this.setSpeech("つかみ空振り", 0.35);
        return false;
      }

      this.grabbedTarget = best;
      this.grabTimer = 1.05;
      best.grabbedBy = this;
      best.grabbedTimer = 1.05;
      best.isGuarding = false;
      best.hitStun = 0;
      best.vx = 0;
      best.vy = 0;
      best.setVisualState("grabbed", 0.3);
      this.setSpeech("つかみ！", 0.45);
      game.spawnText("つかみ！", best.centerX, best.y - 16, "#7ed3ff", 0.45, 16);
      this.updateHeldTargetPosition();
      applyHitStop(game, this, best, 3, 3);
      return true;
    }

    updateHeldTargetPosition() {
      const target = this.grabbedTarget;
      if (!target || target.eliminated || target.grabbedBy !== this) {
        this.grabbedTarget = null;
        return;
      }
      target.x = this.centerX + this.facing * 28 - target.width / 2;
      target.y = this.y + 2;
      target.prevX = target.x;
      target.prevY = target.y;
      target.vx = 0;
      target.vy = 0;
      target.facing = -this.facing;
      target.onGround = this.onGround;
      target.setVisualState("grabbed", 0.12);
    }

    handleThrowInput(game, input) {
      if (!this.grabbedTarget) return;
      const manual = input.normalPressed || input.strongPressed || input.grabPressed || input.up || input.down || Math.abs(input.moveX) > 0.1;
      if (!manual && this.grabTimer > 0) return;

      let throwType = "forward";
      if (input.up) {
        throwType = "up";
      } else if (input.down) {
        throwType = "down";
      } else if (Math.sign(input.moveX) === -this.facing) {
        throwType = "back";
      }
      this.performThrow(game, throwType);
    }

    performThrow(game, throwType = "forward") {
      const target = this.grabbedTarget;
      if (!target) return;
      const direction = throwType === "back" ? -this.facing : this.facing;
      const data = {
        forward: { damage: 6, baseKnockback: 7.2, angle: Math.atan2(-0.42, this.facing), label: "前投げ！" },
        back: { damage: 7, baseKnockback: 8, angle: Math.atan2(-0.35, -this.facing), label: "後ろ投げ！" },
        up: { damage: 6, baseKnockback: 7.6, angle: -Math.PI / 2, label: "上投げ！" },
        down: { damage: 5, baseKnockback: 5.8, angle: Math.atan2(-0.08, direction), label: "下投げ！" }
      }[throwType] ?? { damage: 6, baseKnockback: 7, angle: Math.atan2(-0.42, this.facing), label: "投げ！" };

      this.releaseGrabbedTarget(false);
      this.grabCooldownTimer = 0.72;
      this.attackCooldown = Math.max(this.attackCooldown, 0.42);
      this.setVisualState("strongAttack", 0.28);
      this.setSpeech(data.label, 0.45);

      target.damage += data.damage * this.getAttackMultiplier();
      target.hitFlashTimer = 0.18;
      target.hitStun = Math.max(target.hitStun, throwType === "down" ? 0.32 : 0.22);
      target.lastHitLabel = data.label;
      target.setVisualState("hit", 0.34);
      applyKnockback(this, target, data.baseKnockback * this.getKnockbackMultiplier(), data.angle, throwType === "down" ? 0.075 : 0.105);
      applyHitStop(game, this, target, data.damage, data.baseKnockback);
      game.spawnText(data.label, target.centerX, target.y - 18, "#7ed3ff", 0.5, 17);
      game.spawnHitParticles(target.centerX, target.centerY, target.color, target.damage);
      game.spawnCharacterHitEffect(this, target, data.label);
      this.lastAttackType = `${throwType}Throw`;
      this.lastAttackDirection = throwType;
      this.lastAttackDebugTimer = 1.3;
    }

    releaseGrabbedTarget(clearTargetState = true) {
      const target = this.grabbedTarget;
      if (target) {
        if (target.grabbedBy === this) target.grabbedBy = null;
        target.grabbedTimer = 0;
        if (clearTargetState) {
          target.hitStun = Math.max(target.hitStun, 0.1);
          target.setVisualState("hit", 0.16);
        }
      }
      this.grabbedTarget = null;
      this.grabTimer = 0;
    }

    getSmashAttackTypeFromInput(input) {
      if (input.up) return "upStrongAttack";
      if (input.down) return "downStrongAttack";
      return "strongAttack";
    }

    startSmashCharge(input) {
      this.isChargingSmash = true;
      this.smashChargeTimer = 0;
      this.smashChargeAttackType = this.getSmashAttackTypeFromInput(input);
      this.smashChargePower = 1;
      this.smashChargeKnockback = 1;
      this.vx *= 0.45;
      this.setVisualState(this.smashChargeAttackType, 0.16);
      this.setSpeech("ため中...", 0.28);
    }

    handleSmashCharge(game, input, dt) {
      if (this.hitStun > 0 || this.grabbedBy || this.eliminated) {
        this.cancelSmashCharge();
        return;
      }
      this.smashChargeAttackType = this.getSmashAttackTypeFromInput(input);
      this.smashChargeTimer = clamp(this.smashChargeTimer + dt, 0, 1.25);
      this.vx *= Math.pow(0.74, dt * 60);
      this.setVisualState(this.smashChargeAttackType, 0.12);
      if (Math.floor(this.smashChargeTimer * 12) !== Math.floor((this.smashChargeTimer - dt) * 12)) {
        game.particles.push(new Particle(this.centerX, this.centerY, {
          color: this.smashChargeTimer > 0.85 ? "#ffca3a" : "#ffffff",
          size: 2.5 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 3,
          vy: -1.5 - Math.random() * 2,
          life: 0.25 + Math.random() * 0.15
        }));
      }
      if (!input.strongHeld || this.smashChargeTimer >= 1.25) this.releaseSmashCharge(game);
    }

    releaseSmashCharge(game) {
      if (!this.isChargingSmash) return;
      const charge = clamp(this.smashChargeTimer / 1.25, 0, 1);
      const attackType = this.smashChargeAttackType || "strongAttack";
      this.isChargingSmash = false;
      this.smashChargePower = 1 + charge * 0.42;
      this.smashChargeKnockback = 1 + charge * 0.32;
      this.smashChargeTimer = 0;
      this.setSpeech(charge > 0.82 ? "最大ため！" : "スマッシュ！", 0.42);
      this.performAttack(game, attackType);
      this.smashChargePower = 1;
      this.smashChargeKnockback = 1;
    }

    cancelSmashCharge() {
      this.isChargingSmash = false;
      this.smashChargeTimer = 0;
      this.smashChargePower = 1;
      this.smashChargeKnockback = 1;
    }

    tryJump(game) {
      const boost = this.jumpBoostTimer > 0 ? this.jumpBoostMultiplier : 1;
      if (this.wasGrounded || this.onGround) {
        this.vy = -this.jumpPower * boost;
        this.wasGrounded = false;
        this.onGround = false;
        this.airJumpsRemaining = this.maxAirJumps;
        this.setVisualState("jump", 0.18);
        return;
      }

      if (this.airJumpsRemaining > 0) {
        this.airJumpsRemaining -= 1;
        this.vy = -this.jumpPower * 0.92 * boost;
        this.setVisualState("jump", 0.24);
        this.setSpeech("二段ジャンプ！", 0.35);
        for (let i = 0; i < 7; i += 1) {
          game.particles.push(new Particle(this.centerX, this.y + this.height, {
            color: "rgba(255,255,255,0.9)",
            size: 2 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 4,
            vy: 1 + Math.random() * 2,
            life: 0.32 + Math.random() * 0.18
          }));
        }
      }
    }

    holdGuard(game, move, step, wasGuarding = false) {
      this.isGuarding = true;
      if (!wasGuarding && this.guardJustTimer <= 0) this.guardJustTimer = 0.14;
      this.guardMeter = Math.max(0, this.guardMeter - 11 * step / 60);
      this.setVisualState("guard", 0.12);
      const guardSpeed = this.speed * this.getSpeedMultiplier() * 0.28;
      if (move !== 0) {
        this.vx += (move * guardSpeed - this.vx) * clamp(0.18 * step, 0, 1);
      } else {
        this.vx *= Math.pow(0.76, step);
      }
      if (this.guardMeter <= 0) {
        this.guardBreakTimer = 0.85;
        this.hitStun = Math.max(this.hitStun, 0.55);
        this.isGuarding = false;
        this.setSpeech("ガードブレイク！", 0.8);
        game.spawnText("ガードブレイク！", this.centerX, this.y - 24, "#ff5a5f", 0.8, 21);
      }
    }

    tryDodge(game, input) {
      if (this.dodgeCooldownTimer > 0 || this.guardMeter < 12 || this.guardBreakTimer > 0) return false;
      const horizontal = input.moveX !== 0 ? Math.sign(input.moveX) : 0;
      this.guardMeter = Math.max(0, this.guardMeter - 12);
      this.dodgeTimer = 0.34;
      this.dodgeEndlagTimer = 0.52;
      this.dodgeCooldownTimer = 0.78;
      this.invincibleTimer = Math.max(this.invincibleTimer, 0.34);
      this.setVisualState("dodge", 0.34);
      this.setSpeech("緊急回避！", 0.35);

      if (horizontal !== 0) {
        this.dodgeDirection = horizontal > 0 ? "right" : "left";
        this.facing = horizontal;
        this.vx = horizontal * (this.onGround ? 9.2 : 7.2);
        this.vy = Math.min(this.vy, this.onGround ? -1.2 : 1.5);
      } else if (input.up) {
        this.dodgeDirection = "up";
        this.vx += this.facing * 2.2;
        this.vy = -7.2;
      } else if (input.down) {
        this.dodgeDirection = "down";
        this.vx *= 0.42;
        this.vy = this.onGround ? Math.min(this.vy, -0.6) : 7.2;
      } else {
        this.dodgeDirection = "neutral";
        this.vx *= 0.22;
        this.vy *= 0.55;
      }

      game.spawnDodgeEffect(this);
      return true;
    }

    handleAttackInput(game, power, input) {
      if (!this.onGround && power === "normal") {
        if (input.up) {
          this.performAttack(game, "airUpAttack");
        } else if (input.down) {
          this.performAttack(game, "airDownAttack");
        } else if (Math.sign(input.moveX) === -this.facing) {
          this.performAttack(game, "airBackAttack");
        } else if (Math.sign(input.moveX) === this.facing) {
          this.performAttack(game, "airForwardAttack");
        } else {
          this.performAttack(game, "airAttack");
        }
        return;
      }
      if (input.up) {
        this.performAttack(game, power === "strong" ? "upStrongAttack" : "upAttack");
        return;
      }
      if (input.down) {
        this.performAttack(game, power === "strong" ? "downStrongAttack" : "downAttack");
        return;
      }
      if (power === "strong" && !this.onGround) {
        this.performAttack(game, "airStrongAttack");
        return;
      }
      this.performAttack(game, power === "strong" ? "strongAttack" : "normalAttack");
    }

    performAttack(game, attackType) {
      if (this.attackCooldown > 0) return;
      let config = this.getAttackConfig(attackType);
      if (config.chargeable && (this.smashChargePower > 1 || this.smashChargeKnockback > 1)) {
        config = {
          ...config,
          damage: config.damage * this.smashChargePower,
          baseKnockback: config.baseKnockback * this.smashChargeKnockback,
          cooldown: config.cooldown + 0.08,
          color: config.color?.replace?.("0.58", "0.72") ?? config.color
        };
        game.screenShake = Math.max(game.screenShake, 3 + (this.smashChargePower - 1) * 10);
      }
      this.attackCooldown = config.cooldown;
      this.lastAttackType = attackType;
      this.lastAttackDirection = config.attackDirection ?? effectThemeKeyForAttack(attackType);
      this.lastAttackDebugTimer = 1.5;
      this.setVisualState(config.visualState, config.poseDuration);
      game.spawnCharacterAttackEffect(this, attackType, config);
      playSfx(effectThemeKeyForAttack(attackType));
      if (config.recovery) {
        this.hasUsedRecovery = true;
        this.vy = Math.min(this.vy, -this.jumpPower * 1.08);
        this.vx += this.facing * 1.6;
      }
      if (config.selfVelocityX) {
        this.vx += this.facing * config.selfVelocityX;
      }

      if (config.projectile) {
        game.addProjectile(
          this,
          config.projectileOffsetX,
          config.projectileOffsetY,
          config.width,
          config.height,
          config.vx * this.facing,
          config.vy,
          config.duration + config.startup + 0.55,
          config.damage,
          config.baseKnockback,
          config.label,
          config.color,
          "",
          config.angle,
          config.projectileKind,
          config.damageScale
        );
      } else {
        game.hitboxes.push(new AttackHitbox({
          owner: this,
          offsetX: config.offsetX,
          offsetY: config.offsetY,
          width: config.width,
          height: config.height,
          damage: config.damage,
          baseKnockback: config.baseKnockback,
          damageScale: config.damageScale,
          duration: config.duration,
          startup: config.startup,
          color: config.color,
          label: config.label,
          angle: config.angle
        }));
      }

      if (config.speech) this.setSpeech(config.speech, config.speechDuration ?? 0.5);
    }

    getAttackConfig(attackType) {
      const character = this.selectedCharacter;
      const happy = character.id === "happy_repeat_student";
      const ranged = ["ranged", "control", "support"].includes(character.archetype) || happy;
      const attackMultiplier = this.getAttackMultiplier();
      const knockbackMultiplier = this.getKnockbackMultiplier();
      const scaledDamage = (type, fallback = type) => (ATTACK_DATA[type] ?? ATTACK_DATA[fallback]).damage * attackMultiplier;
      const scaledKnockback = (type, fallback = type) => (ATTACK_DATA[type] ?? ATTACK_DATA[fallback]).baseKnockback * knockbackMultiplier;
      const scaleFor = (type, fallback = type) => (ATTACK_DATA[type] ?? ATTACK_DATA[fallback]).damageScale;
      const forwardAngle = Math.atan2(-0.25, this.facing);
      const forwardUpAngle = Math.atan2(-0.75, this.facing * 0.75);
      const forwardDownAngle = Math.atan2(-0.1, this.facing * 0.9);
      const forwardStrongX = (width) => this.facing > 0 ? this.width : -width;
      const angledStrongX = (width) => this.facing > 0 ? this.width * 0.6 : -width + this.width * 0.4;
      const strongProfile = originalStrongProfile(character);
      const strongOffsetX = strongProfile.attackDirection === "forward" ? forwardStrongX(strongProfile.width) : angledStrongX(strongProfile.width);
      const strongOffsetY = strongProfile.attackDirection === "forwardUp"
        ? -10
        : strongProfile.attackDirection === "forwardDown"
          ? this.height * 0.54
          : this.height * strongProfile.offsetYRatio;
      const strongAngle = Math.atan2(strongProfile.angleY, this.facing);
      const configs = {
        normalAttack: {
          label: happy ? "指導案！" : character.normalAttack,
          speech: happy ? "指導案！" : "",
          width: happy ? 54 : ranged ? 32 : 58,
          height: happy ? 22 : ranged ? 22 : 32,
          offsetX: this.facing > 0 ? this.width - 2 : (happy ? -88 : -58) + 2,
          offsetY: happy ? 15 : 10,
          damage: scaledDamage("projectileAttack", "normalAttack"),
          baseKnockback: scaledKnockback("projectileAttack", "normalAttack"),
          damageScale: ranged ? scaleFor("projectileAttack") : scaleFor("normalAttack"),
          cooldown: 0.3,
          duration: happy ? 0.18 : 0.12,
          startup: 0.035,
          color: happy ? "rgba(255, 255, 255, 0.86)" : "rgba(255, 255, 255, 0.5)",
          visualState: this.onGround ? "attack" : "airAttack",
          poseDuration: 0.22,
          projectile: ranged,
          projectileOffsetX: 10,
          projectileOffsetY: happy ? 15 : 14,
          vx: happy ? 6.2 : 7,
          vy: 0,
          projectileKind: happy ? "lesson_plan" : "paper"
        },
        strongAttack: {
          label: character.strongAttack,
          speech: character.strongAttack,
          width: strongProfile.width,
          height: strongProfile.height,
          offsetX: strongOffsetX,
          offsetY: strongOffsetY,
          damage: scaledDamage("strongAttack") * strongProfile.damageMultiplier,
          baseKnockback: scaledKnockback("strongAttack") * strongProfile.knockbackMultiplier,
          damageScale: scaleFor("strongAttack") * strongProfile.damageScaleMultiplier,
          cooldown: strongProfile.cooldown,
          duration: strongProfile.duration,
          startup: strongProfile.startup,
          color: strongProfile.color,
          angle: strongAngle,
          attackDirection: strongProfile.attackDirection,
          chargeable: true,
          projectile: strongProfile.projectile,
          projectileOffsetX: 10,
          projectileOffsetY: strongOffsetY,
          vx: strongProfile.projectileVx,
          vy: strongProfile.projectileVy,
          projectileKind: strongProfile.projectileKind,
          selfVelocityX: strongProfile.selfVelocityX,
          effectText: character.strongAttack,
          visualState: "strongAttack",
          poseDuration: clamp(0.34 + strongProfile.startup, 0.38, 0.58)
        },
        upAttack: {
          label: happy ? "指導案チェック！" : character.upAttack,
          speech: happy ? "チェック上げ！" : "",
          width: 54,
          height: 70,
          offsetX: -9,
          offsetY: -48,
          damage: scaledDamage("upAttack"),
          baseKnockback: scaledKnockback("upAttack"),
          damageScale: scaleFor("upAttack"),
          cooldown: 0.34,
          duration: 0.14,
          startup: 0.05,
          color: happy ? "rgba(255,255,255,0.84)" : "rgba(126, 211, 255, 0.5)",
          angle: -Math.PI / 2,
          visualState: "upAttack",
          poseDuration: 0.25,
          projectile: ranged && !happy,
          projectileOffsetX: 2,
          projectileOffsetY: -38,
          vx: 2.4,
          vy: -5.8,
          projectileKind: "paper"
        },
        downAttack: {
          label: happy ? "実習日誌！" : character.downAttack,
          speech: happy ? "実習日誌！" : "",
          width: 72,
          height: 28,
          offsetX: this.facing > 0 ? 6 : -42,
          offsetY: 36,
          damage: scaledDamage("downAttack"),
          baseKnockback: scaledKnockback("downAttack"),
          damageScale: scaleFor("downAttack"),
          cooldown: 0.36,
          duration: 0.16,
          startup: 0.06,
          color: happy ? "rgba(255, 210, 63, 0.62)" : "rgba(124, 201, 67, 0.46)",
          visualState: "downAttack",
          poseDuration: 0.25
        },
        upStrongAttack: {
          label: happy ? "反省会アッパー！" : character.upStrongAttack,
          speech: happy ? "反省会！" : "",
          width: 72,
          height: 50,
          offsetX: angledStrongX(72),
          offsetY: -18,
          damage: scaledDamage("upStrongAttack"),
          baseKnockback: scaledKnockback("upStrongAttack"),
          damageScale: scaleFor("upStrongAttack"),
          cooldown: 0.72,
          duration: 0.19,
          startup: 0.2,
          color: happy ? "rgba(255, 80, 80, 0.6)" : "rgba(255, 202, 58, 0.6)",
          angle: forwardUpAngle,
          attackDirection: "forwardUp",
          chargeable: true,
          visualState: "upStrongAttack",
          poseDuration: 0.46
        },
        downStrongAttack: {
          label: happy ? "実習日誌確認！" : character.downStrongAttack,
          speech: happy ? "指導案修正中！" : "",
          width: 76,
          height: 38,
          offsetX: angledStrongX(76),
          offsetY: this.height * 0.55,
          damage: scaledDamage("downStrongAttack"),
          baseKnockback: scaledKnockback("downStrongAttack"),
          damageScale: scaleFor("downStrongAttack"),
          cooldown: 0.7,
          duration: 0.2,
          startup: 0.19,
          color: happy ? "rgba(255, 80, 80, 0.56)" : "rgba(255, 143, 94, 0.58)",
          angle: forwardDownAngle,
          attackDirection: "forwardDown",
          chargeable: true,
          visualState: "downStrongAttack",
          poseDuration: 0.45
        },
        airAttack: {
          label: character.airAttack,
          width: 62,
          height: 44,
          offsetX: this.facing > 0 ? this.width - 6 : -56,
          offsetY: 4,
          damage: scaledDamage("airAttack"),
          baseKnockback: scaledKnockback("airAttack"),
          damageScale: scaleFor("airAttack"),
          cooldown: 0.42,
          duration: 0.16,
          startup: 0.06,
          color: "rgba(255,255,255,0.52)",
          visualState: "airAttack",
          poseDuration: 0.28
        },
        airForwardAttack: {
          label: `${character.normalAttack} 前空中`,
          width: 68,
          height: 38,
          offsetX: this.facing > 0 ? this.width - 4 : -64,
          offsetY: 2,
          damage: scaledDamage("airAttack") * 1.05,
          baseKnockback: scaledKnockback("airAttack") * 1.02,
          damageScale: scaleFor("airAttack"),
          cooldown: 0.46,
          duration: 0.16,
          startup: 0.07,
          color: "rgba(255,255,255,0.54)",
          angle: Math.atan2(-0.18, this.facing),
          attackDirection: "airForward",
          visualState: "airAttack",
          poseDuration: 0.3
        },
        airBackAttack: {
          label: `${character.strongAttack} 後空中`,
          width: 66,
          height: 40,
          offsetX: this.facing > 0 ? -60 : this.width - 6,
          offsetY: 0,
          damage: scaledDamage("airAttack") * 1.16,
          baseKnockback: scaledKnockback("airAttack") * 1.18,
          damageScale: scaleFor("airAttack") * 1.05,
          cooldown: 0.52,
          duration: 0.16,
          startup: 0.09,
          color: "rgba(255,202,58,0.5)",
          angle: Math.atan2(-0.22, -this.facing),
          attackDirection: "airBack",
          visualState: "airAttack",
          poseDuration: 0.32
        },
        airUpAttack: {
          label: `${character.upAttack} 空中`,
          width: 58,
          height: 58,
          offsetX: -14,
          offsetY: -46,
          damage: scaledDamage("airAttack") * 0.96,
          baseKnockback: scaledKnockback("airAttack") * 0.96,
          damageScale: scaleFor("airAttack"),
          cooldown: 0.44,
          duration: 0.17,
          startup: 0.06,
          color: "rgba(126,211,255,0.52)",
          angle: -Math.PI / 2,
          attackDirection: "airUp",
          visualState: "airAttack",
          poseDuration: 0.3
        },
        airDownAttack: {
          label: `${character.downAttack} 空中`,
          width: 54,
          height: 58,
          offsetX: -12,
          offsetY: this.height * 0.55,
          damage: scaledDamage("airAttack") * 1.08,
          baseKnockback: scaledKnockback("airAttack") * 1.04,
          damageScale: scaleFor("airAttack"),
          cooldown: 0.5,
          duration: 0.18,
          startup: 0.1,
          color: "rgba(255,143,94,0.5)",
          angle: Math.PI / 2,
          attackDirection: "airDown",
          visualState: "airAttack",
          poseDuration: 0.34
        },
        airStrongAttack: {
          label: `${character.strongAttack} 空中`,
          width: clamp(strongProfile.width - 6, 50, 92),
          height: clamp(strongProfile.height + 4, 34, 68),
          offsetX: this.facing > 0 ? this.width - 6 : -clamp(strongProfile.width - 6, 50, 92) + 6,
          offsetY: strongProfile.attackDirection === "forwardDown" ? 18 : strongProfile.attackDirection === "forwardUp" ? -18 : 0,
          damage: scaledDamage("airStrongAttack") * clamp(strongProfile.damageMultiplier, 0.9, 1.12),
          baseKnockback: scaledKnockback("airStrongAttack") * clamp(strongProfile.knockbackMultiplier, 0.9, 1.18),
          damageScale: scaleFor("airStrongAttack") * strongProfile.damageScaleMultiplier,
          cooldown: clamp(strongProfile.cooldown - 0.06, 0.5, 0.76),
          duration: clamp(strongProfile.duration, 0.16, 0.24),
          startup: clamp(strongProfile.startup - 0.04, 0.07, 0.18),
          color: strongProfile.color,
          angle: strongAngle,
          attackDirection: `air-${strongProfile.attackDirection}`,
          effectText: `${character.strongAttack} 空中`,
          visualState: "airAttack",
          poseDuration: 0.34
        },
        recoveryMove: {
          label: character.recoveryMove,
          width: 58,
          height: 72,
          offsetX: -11,
          offsetY: -58,
          damage: scaledDamage("recoveryMove"),
          baseKnockback: scaledKnockback("recoveryMove"),
          damageScale: scaleFor("recoveryMove"),
          cooldown: 0.82,
          duration: 0.2,
          startup: 0.08,
          color: "rgba(126, 211, 255, 0.58)",
          angle: -Math.PI / 2,
          visualState: "recovery",
          poseDuration: 0.46,
          recovery: true
        }
      };
      return applyCharacterMoveProfile(character, attackType, configs[attackType] ?? configs.normalAttack, this);
    }

    normalAttack(game) {
      this.performAttack(game, this.onGround ? "normalAttack" : "airAttack");
    }

    strongAttack(game) {
      this.performAttack(game, this.onGround ? "strongAttack" : "airStrongAttack");
    }

    useSkill(game) {
      if (this.skillCooldownTimer > 0 || this.happyStallTimer > 0) return;
      const id = this.selectedCharacter.id;
      this.skillCooldownTimer = getSkillCooldown(id);
      this.setVisualState(["firefighter", "realtor", "hairdresser"].includes(id) ? "recovery" : "skill", 0.62);
      game.spawnCharacterAttackEffect(this, "skill", { label: this.selectedCharacter.skill, width: 104, height: 80 });
      playSfx("skill");

      switch (id) {
        case "salaryman":
          game.addZone(this, "slow", this.x - 66, this.y - 46, 168, 142, 1.8, "緊急会議！", "rgba(79, 124, 172, 0.32)");
          break;
        case "programmer":
          game.addProjectile(this, 10, 10, 26, 26, 7 * this.facing, 0, 2, 6, 4, "バグ修正中！", "rgba(60, 110, 113, 0.72)", "glitch");
          break;
        case "chef":
          game.addZone(this, "damagePulse", this.facing > 0 ? this.x + this.width : this.x - 92, this.y + 8, 92, 36, 0.85, "激辛注意！", "rgba(228, 87, 46, 0.5)", 2, 2.4);
          break;
        case "doctor":
          this.damage = Math.max(0, this.damage - 15);
          game.spawnText("応急処置！", this.centerX, this.y - 20, "#58b4ae", 0.9);
          this.setSpeech("応急処置！", 0.8);
          break;
        case "nurse":
          this.barrierTimer = 1.2;
          game.spawnText("包帯ガード！", this.centerX, this.y - 20, "#f28ab2", 0.9);
          break;
        case "lawyer":
          game.addProjectile(this, 12, 14, 56, 18, 8 * this.facing, -0.4, 1.8, 5, 7, "証拠を提出します！", "rgba(255, 255, 255, 0.8)", "push");
          break;
        case "teacher":
          game.addZone(this, "stop", this.x - 54, this.y - 42, 144, 124, 0.48, "抜き打ちテスト！", "rgba(42, 157, 143, 0.42)", 4, 3);
          break;
        case "firefighter":
          this.vx -= this.facing * 7;
          this.vy = Math.min(this.vy, -4);
          game.addZone(this, "damagePulse", this.facing > 0 ? this.x + this.width : this.x - 120, this.y + 6, 120, 40, 0.55, "放水開始！", "rgba(68, 188, 255, 0.48)", 3, 5);
          break;
        case "police":
          game.addZone(this, "stop", this.x - 56, this.y - 8, 150, 72, 1.45, "止まりなさい！", "rgba(29, 78, 137, 0.34)");
          break;
        case "construction":
          game.platforms.push(new Platform(clamp(this.x + this.facing * 86, 40, W - 180), clamp(this.y - 54, 150, 380), 140, 18, {
            temporary: true,
            lifetime: 5,
            ownerId: this.id,
            color: "#ffca3a"
          }));
          game.spawnText("足場設置！", this.centerX, this.y - 22, "#f4a261", 0.85);
          break;
        case "delivery":
          this.vx = this.facing * 13;
          game.hitboxes.push(new AttackHitbox({
            owner: this,
            offsetX: this.facing > 0 ? this.width - 4 : -58,
            offsetY: 8,
            width: 62,
            height: 34,
            damage: 6 * this.getAttackMultiplier(),
            baseKnockback: 5.4 * this.getKnockbackMultiplier(),
            duration: 0.22,
            color: "rgba(255, 183, 3, 0.52)",
            label: "お急ぎ便！"
          }));
          break;
        case "barista":
          this.speedBoostTimer = 4;
          this.speedBoostMultiplier = 1.25;
          this.setSpeech("カフェイン注入！", 0.9);
          break;
        case "hairdresser":
          this.invincibleTimer = Math.max(this.invincibleTimer, 0.65);
          this.vx = this.facing * 10;
          this.setSpeech("整いました！", 0.8);
          break;
        case "farmer":
          game.skillEffects.push(new SkillEffect({
            type: "trap",
            owner: this,
            x: this.centerX - 18,
            y: this.y + this.height - 12,
            width: 36,
            height: 14,
            duration: 7,
            damage: 6,
            baseKnockback: 4,
            label: "収穫の時間！",
            color: "rgba(106, 153, 78, 0.72)"
          }));
          break;
        case "researcher":
          this.useResearcherSkill(game);
          break;
        case "security":
          this.counterTimer = 1.5;
          this.setSpeech("巡回中！", 0.9);
          break;
        case "cleaner":
          game.skillEffects.push(new SkillEffect({
            type: "wax",
            effect: "wax",
            owner: this,
            x: clamp(this.x - 30, 0, W - 180),
            y: this.y + this.height - 8,
            width: 180,
            height: 18,
            duration: 4.2,
            label: "ワックス注意！",
            color: "rgba(0, 175, 185, 0.38)"
          }));
          break;
        case "realtor":
          this.x = clamp(this.x + this.facing * 120, 10, W - this.width - 10);
          this.y = clamp(this.y - 65, 80, H - this.height - 80);
          this.invincibleTimer = Math.max(this.invincibleTimer, 0.25);
          this.setSpeech("即入居可！", 0.8);
          break;
        case "streamer":
          this.buzzTimer = 5;
          this.setSpeech("バズった！", 1);
          break;
        case "accountant":
          game.skillEffects.push(new SkillEffect({
            type: "shield",
            effect: "shield",
            owner: this,
            x: this.facing > 0 ? this.x + this.width : this.x - 60,
            y: this.y - 2,
            width: 60,
            height: 62,
            duration: 1.5,
            label: "控除します！",
            color: "rgba(17, 138, 178, 0.42)"
          }));
          this.barrierTimer = 0.9;
          break;
        case "happy_repeat_student":
          this.useHappySkill(game);
          break;
        default:
          this.useGenericJobSkill(game);
      }
    }

    useResearcherSkill(game) {
      const roll = Math.floor(Math.random() * 3);
      if (roll === 0) {
        this.speedBoostTimer = 4;
        this.speedBoostMultiplier = 1.3;
        this.setSpeech("速度実験！", 0.9);
      } else if (roll === 1) {
        this.jumpBoostTimer = 4;
        this.jumpBoostMultiplier = 1.22;
        this.setSpeech("跳躍実験！", 0.9);
      } else {
        game.addZone(this, "damagePulse", this.x - 54, this.y - 44, 144, 132, 0.35, "実験開始！", "rgba(67, 170, 139, 0.44)", 8, 7);
      }
    }

    useHappySkill(game) {
      const bonus = clamp(this.damage / 100, 0, 1);
      this.happySpeedMultiplier = clamp(1 + bonus * 0.25, 1, 1.25);
      this.happyAttackMultiplier = clamp(1 + bonus * 0.20, 1, 1.2);
      this.happyKnockbackMultiplier = clamp(1 + bonus * 0.25, 1, 1.25);
      this.happyBuffTimer = 5;
      this.happyStallTimer = 0;
      this.skillCooldownTimer = 9;
      this.setSpeech("足りないのは単位じゃない！", 1.8);
      game.spawnText("HAPPY教育実習！", this.centerX, this.y - 28, "#ffd23f", 1.35, 28);
      for (let i = 0; i < 20; i += 1) {
        game.particles.push(new Particle(this.centerX, this.centerY, {
          color: i % 2 === 0 ? "#ffd23f" : "#ffffff",
          size: 3 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 7,
          vy: -Math.random() * 6,
          life: 0.8 + Math.random() * 0.35
        }));
      }
    }

    useGenericJobSkill(game) {
      const character = this.selectedCharacter;
      const archetype = character.archetype ?? "midrange";
      const family = inferEffectFamily(character);
      const theme = character.effectTheme?.skill ?? `${family}_skill_${character.id}`;
      const seed = hashString(`${character.id}:${character.skill}:genericSkill`);
      const color = effectColorForTheme(theme, character, "skill");
      const textColor = colorToText(color);
      const label = `${character.skill}！`;
      const forwardX = this.facing > 0 ? this.x + this.width : this.x - 96;
      const zoneW = 92 + (seed % 52);
      const zoneH = 54 + ((seed >> 4) % 46);
      const damage = 4.5 + (seed % 5) * 0.7;
      const knockback = 3.8 + ((seed >> 6) % 6) * 0.55;

      this.setSpeech(label, 0.9);
      game.spawnText(label, this.centerX, this.y - 24, textColor, 0.95, 18);
      for (let i = 0; i < 12; i += 1) {
        game.particles.push(new Particle(this.centerX, this.centerY, {
          color,
          size: 2 + Math.random() * 4,
          vx: (Math.random() - 0.5) * (4 + (seed % 4)),
          vy: -1 - Math.random() * 4,
          life: 0.38 + Math.random() * 0.28
        }));
      }

      if (archetype === "ranged") {
        const count = seed % 3 === 0 ? 2 : 1;
        for (let i = 0; i < count; i += 1) {
          game.addProjectile(
            this,
            10 + i * 4,
            8 + i * 12,
            44 + (seed % 24),
            20 + ((seed >> 5) % 18),
            (7.4 + (seed % 5) * 0.6) * this.facing,
            (i - 0.5) * 0.55,
            1.25,
            damage,
            knockback,
            label,
            color,
            "push",
            null,
            /water/.test(family) ? "water" : /paper/.test(family) ? "paper" : "spark"
          );
        }
        return;
      }

      if (archetype === "mobility") {
        this.speedBoostTimer = Math.max(this.speedBoostTimer, 2.6 + (seed % 20) / 10);
        this.speedBoostMultiplier = Math.max(this.speedBoostMultiplier, 1.18 + (seed % 5) * 0.035);
        this.vx = this.facing * (9 + (seed % 5));
        game.hitboxes.push(new AttackHitbox({
          owner: this,
          offsetX: this.facing > 0 ? this.width - 4 : -68,
          offsetY: 8,
          width: 72,
          height: 34,
          damage: damage * this.getAttackMultiplier(),
          baseKnockback: knockback * this.getKnockbackMultiplier(),
          damageScale: ATTACK_DATA.skillAttack.damageScale,
          duration: 0.18,
          startup: 0.02,
          color,
          label
        }));
        return;
      }

      if (archetype === "heavy" || archetype === "melee") {
        this.barrierTimer = Math.max(this.barrierTimer, archetype === "heavy" ? 0.72 : 0.34);
        game.hitboxes.push(new AttackHitbox({
          owner: this,
          offsetX: this.facing > 0 ? this.width - 8 : -104,
          offsetY: -4,
          width: archetype === "heavy" ? 112 : 92,
          height: archetype === "heavy" ? 76 : 58,
          damage: (damage + (archetype === "heavy" ? 2.2 : 0.9)) * this.getAttackMultiplier(),
          baseKnockback: (knockback + (archetype === "heavy" ? 3.3 : 1.4)) * this.getKnockbackMultiplier(),
          damageScale: ATTACK_DATA.strongAttack.damageScale,
          duration: 0.2,
          startup: archetype === "heavy" ? 0.08 : 0.04,
          color,
          label
        }));
        return;
      }

      if (archetype === "defense" || archetype === "support") {
        this.barrierTimer = Math.max(this.barrierTimer, archetype === "defense" ? 1.05 : 0.62);
        if (archetype === "support") this.damage = Math.max(0, this.damage - (7 + (seed % 7)));
        game.addZone(this, "slow", this.x - 54, this.y - 42, 144 + (seed % 42), 118, 1.25, label, color, 0, 0);
        return;
      }

      if (archetype === "technical" || archetype === "control") {
        const effect = seed % 2 === 0 ? "stop" : "damagePulse";
        game.addZone(
          this,
          effect,
          clamp(this.x - 44 + this.facing * 22, 0, W - 190),
          clamp(this.y - 32, 40, H - 120),
          154 + (seed % 44),
          92 + ((seed >> 7) % 42),
          effect === "stop" ? 0.55 : 0.9,
          label,
          color,
          effect === "stop" ? damage * 0.55 : damage,
          knockback
        );
        return;
      }

      game.addZone(this, "damagePulse", forwardX, this.y + 2, zoneW, zoneH, 0.8, label, color, damage, knockback);
    }

    tryUseUltimate(game) {
      const ultimate = this.selectedCharacter.ultimate;
      if (!ultimate || this.ultimateCooldownTimer > 0 || this.isUsingUltimate || this.eliminated) return;
      if (this.hitStun > 0 || this.happyStallTimer > 0) return;

      this.isUsingUltimate = true;
      this.ultimatePhase = "startup";
      this.ultimateTimer = ultimate.startup;
      this.ultimateCooldownTimer = ultimate.cooldown;
      this.attackCooldown = Math.max(this.attackCooldown, ultimate.startup + ultimate.active + ultimate.endlag);
      this.setVisualState("ultimate", ultimate.startup + ultimate.active);
      this.setSpeech(ultimate.name, 1.2);
      game.spawnText(ultimate.name, this.centerX, this.y - 38, "#ffd23f", 1.3, 24);
      game.spawnCharacterAttackEffect(this, "ultimate", {
        label: ultimate.name,
        width: 180,
        height: 130,
        startup: 0,
        duration: ultimate.startup,
        color: this.selectedCharacter.appearance?.accentColor ?? this.color
      });
      playSfx("ultimate_ready");
    }

    activateUltimate(game) {
      const ultimate = this.selectedCharacter.ultimate;
      const direction = this.facing || 1;
      const damage = ultimate.damage * this.getAttackMultiplier();
      const baseKnockback = ultimate.baseKnockback * this.getKnockbackMultiplier();
      const common = {
        owner: this,
        damage,
        baseKnockback,
        damageScale: ultimate.damageScale,
        duration: ultimate.active,
        startup: 0,
        color: "rgba(255, 210, 63, 0.42)",
        label: ultimate.name
      };

      if (ultimate.rangeType === "ranged") {
        game.addProjectile(this, 18, -2, 92, 38, 10.5 * direction, -0.1, 1.25, ultimate.damage, ultimate.baseKnockback, ultimate.name, "rgba(255,255,255,0.92)", "push", null, "paper", ultimate.damageScale);
      } else if (ultimate.rangeType === "dash") {
        this.vx = direction * 16;
        game.hitboxes.push(new AttackHitbox({
          ...common,
          offsetX: direction > 0 ? this.width - 8 : -120,
          offsetY: -10,
          width: 128,
          height: 62
        }));
      } else if (ultimate.rangeType === "control") {
        game.addZone(this, "stop", this.x - 96, this.y - 72, 222, 168, ultimate.active, ultimate.name, "rgba(255,210,63,0.34)", ultimate.damage * 0.62, ultimate.baseKnockback * 0.72);
        game.hitboxes.push(new AttackHitbox({
          ...common,
          followOwner: false,
          x: this.x - 80,
          y: this.y - 48,
          width: 190,
          height: 128
        }));
      } else if (ultimate.rangeType === "area") {
        game.hitboxes.push(new AttackHitbox({
          ...common,
          followOwner: false,
          x: this.centerX - 132,
          y: this.centerY - 104,
          width: 264,
          height: 190
        }));
      } else {
        game.hitboxes.push(new AttackHitbox({
          ...common,
          offsetX: direction > 0 ? this.width - 12 : -142,
          offsetY: -20,
          width: 154,
          height: 82
        }));
      }

      game.spawnCharacterAttackEffect(this, "ultimate", {
        label: ultimate.name,
        width: 240,
        height: 180,
        duration: ultimate.active,
        color: this.selectedCharacter.appearance?.accentColor ?? this.color
      });
      game.screenShake = Math.max(game.screenShake, 13);
      playSfx("ultimate_hit");
    }

    draw(ctx, debug) {
      if (this.eliminated) return;
      CharacterRenderer.draw(ctx, this);

      if (debug) {
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#18212f";
        ctx.font = "11px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${Math.round(this.x)},${Math.round(this.y)}`, this.x, this.y + this.height + 18);
        ctx.restore();
      }
    }
  }

  class StageHazard {
    constructor(config, stage, manager) {
      this.config = config;
      this.stage = stage;
      this.manager = manager;
      this.nextTrigger = config.firstTrigger ?? config.interval ?? 8;
      this.activeTimer = 0;
      this.drops = [];
      this.carts = [];
      this.pendingCart = null;
    }

    update(dt, game) {
      this.nextTrigger -= dt;
      if (this.nextTrigger <= 0) {
        this.trigger(game);
        this.nextTrigger += this.config.interval ?? 8;
      }

      if (this.activeTimer > 0) {
        this.activeTimer = Math.max(0, this.activeTimer - dt);
        if (this.config.type === "overtimeAlert") {
          for (const player of game.players) {
            if (player.eliminated) continue;
            player.stageSpeedBoostTimer = Math.max(player.stageSpeedBoostTimer, 0.16);
            player.stageSpeedBoostMultiplier = 1.12;
          }
        }
      }

      if (this.config.type === "popQuiz") this.updatePopQuiz(dt, game);
      if (this.config.type === "runawayCart") this.updateRunawayCart(dt, game);
    }

    trigger(game) {
      this.activeTimer = this.config.duration ?? 2;
      if (this.config.type === "overtimeAlert") {
        this.manager.announce("残業アラート！", "終電まで急げ！", "#fff176");
        return;
      }

      if (this.config.type === "popQuiz") {
        this.manager.announce("抜き打ち小テスト！", "答案用紙が落ちてきます", "#ffffff");
        const count = game.players.length >= 3 ? 2 : 1;
        for (let i = 0; i < count; i += 1) {
          this.drops.push({
            x: 150 + Math.random() * 660,
            y: -42,
            width: 42,
            height: 34,
            warningTimer: 0.85,
            vy: 4.8 + Math.random() * 0.8,
            hitPlayers: new Set()
          });
        }
        return;
      }

      if (this.config.type === "runawayCart") {
        const direction = Math.random() < 0.5 ? 1 : -1;
        const main = this.stage.platforms.find((platform) => platform.type === "main") ?? this.stage.platforms[0];
        this.pendingCart = {
          timer: 0.9,
          direction,
          y: main.y - 30
        };
        this.manager.announce("台車注意！", direction > 0 ? "左から来ます" : "右から来ます", "#ffd166");
        return;
      }

      if (this.config.type === "movingPlatformNotice") {
        this.manager.announce("足場移動中！", "仮設足場がゆっくり往復します", "#ffca3a");
      }
    }

    updatePopQuiz(dt, game) {
      for (const drop of this.drops) {
        if (drop.warningTimer > 0) {
          drop.warningTimer = Math.max(0, drop.warningTimer - dt);
          continue;
        }

        drop.y += drop.vy * dt * 60;
        const rect = { x: drop.x, y: drop.y, width: drop.width, height: drop.height };
        for (const player of game.players) {
          if (player.eliminated || drop.hitPlayers.has(player.id)) continue;
          if (rectsOverlap(rect, player.getRect())) {
            drop.hitPlayers.add(player.id);
            damagePlayer(game, null, player, 4, 3, "小テスト！");
            player.hitStun = Math.max(player.hitStun, 0.16);
          }
        }
      }
      this.drops = this.drops.filter((drop) => drop.y < H + 60 && drop.hitPlayers.size < game.players.length);
    }

    updateRunawayCart(dt, game) {
      if (this.pendingCart) {
        this.pendingCart.timer -= dt;
        if (this.pendingCart.timer <= 0) {
          const direction = this.pendingCart.direction;
          this.carts.push({
            x: direction > 0 ? -82 : W + 82,
            y: this.pendingCart.y,
            width: 72,
            height: 28,
            vx: direction * 6.2,
            hitPlayers: new Set()
          });
          this.pendingCart = null;
        }
      }

      for (const cart of this.carts) {
        cart.x += cart.vx * dt * 60;
        const rect = { x: cart.x, y: cart.y, width: cart.width, height: cart.height };
        for (const player of game.players) {
          if (player.eliminated || cart.hitPlayers.has(player.id)) continue;
          if (rectsOverlap(rect, player.getRect())) {
            cart.hitPlayers.add(player.id);
            damagePlayer(game, null, player, 5, 6, "暴走台車！");
            player.vx += Math.sign(cart.vx) * 3.5;
          }
        }
      }
      this.carts = this.carts.filter((cart) => cart.x > -140 && cart.x < W + 140);
    }

    draw(ctx) {
      if (this.config.type === "popQuiz") {
        for (const drop of this.drops) {
          ctx.save();
          if (drop.warningTimer > 0) {
            ctx.globalAlpha = 0.68;
            ctx.fillStyle = "rgba(255, 80, 80, 0.28)";
            roundRect(ctx, drop.x - 8, 92, drop.width + 16, H - 180, 8);
            ctx.fill();
            ctx.fillStyle = "#d5382f";
            ctx.font = "900 24px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("!", drop.x + drop.width / 2, 124);
          } else {
            ctx.fillStyle = "rgba(255,255,255,0.92)";
            roundRect(ctx, drop.x, drop.y, drop.width, drop.height, 4);
            ctx.fill();
            ctx.strokeStyle = "#ef476f";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drop.x + 8, drop.y + 10);
            ctx.lineTo(drop.x + drop.width - 8, drop.y + 10);
            ctx.moveTo(drop.x + 8, drop.y + 19);
            ctx.lineTo(drop.x + drop.width - 12, drop.y + 19);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      if (this.config.type === "runawayCart") {
        if (this.pendingCart) {
          ctx.save();
          ctx.globalAlpha = 0.78;
          ctx.fillStyle = "#ffd166";
          ctx.font = "900 18px sans-serif";
          ctx.textAlign = this.pendingCart.direction > 0 ? "left" : "right";
          ctx.fillText("台車注意！", this.pendingCart.direction > 0 ? 24 : W - 24, this.pendingCart.y - 10);
          ctx.restore();
        }
        for (const cart of this.carts) {
          ctx.save();
          ctx.fillStyle = "#8d99ae";
          roundRect(ctx, cart.x, cart.y, cart.width, cart.height, 6);
          ctx.fill();
          ctx.fillStyle = "#2b2d42";
          ctx.beginPath();
          ctx.arc(cart.x + 15, cart.y + cart.height + 4, 6, 0, Math.PI * 2);
          ctx.arc(cart.x + cart.width - 15, cart.y + cart.height + 4, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  class StageManager {
    constructor(game) {
      this.game = game;
      this.selectedIndex = 0;
      this.activeStage = stages[0];
      this.hazards = [];
      this.bannerText = "";
      this.bannerSubText = "";
      this.bannerTimer = 0;
      this.bannerColor = "#ffffff";
      this.preview = document.getElementById("stagePreview");
      this.cards = document.getElementById("stageCards");
      this.renderStageSelect();
    }

    get selectedStage() {
      return stages[this.selectedIndex];
    }

    reset() {
      this.selectedIndex = 0;
      this.activeStage = stages[0];
      this.hazards = [];
      this.bannerTimer = 0;
      this.renderStageSelect();
    }

    selectNext(direction) {
      this.selectedIndex = (this.selectedIndex + direction + stages.length) % stages.length;
      this.renderStageSelect();
    }

    startSelectedStage() {
      this.activeStage = this.selectedStage;
      this.hazards = this.activeStage.hazards.map((hazard) => new StageHazard(hazard, this.activeStage, this));
      this.bannerTimer = 0;
    }

    createPlatforms() {
      return this.activeStage.platforms.map((data) => {
        const color = data.type === "main" ? this.activeStage.platformColor : shadeStageColor(this.activeStage.platformColor, data.type === "moving" ? 28 : 15);
        const options = { ...data, color };
        if (data.type === "moving") {
          return new MovingPlatform(data.x, data.y, data.width, data.height, options);
        }
        return new Platform(data.x, data.y, data.width, data.height, options);
      });
    }

    update(dt, game) {
      this.bannerTimer = Math.max(0, this.bannerTimer - dt);
      for (const hazard of this.hazards) hazard.update(dt, game);
    }

    announce(text, subText, color = "#ffffff") {
      this.bannerText = text;
      this.bannerSubText = subText;
      this.bannerColor = color;
      this.bannerTimer = 2.2;
      this.game.spawnText(text, W / 2, 145, color, 1, 26);
    }

    renderStageSelect() {
      if (!this.preview || !this.cards) return;
      const stage = this.selectedStage;
      this.preview.replaceChildren();
      this.cards.replaceChildren();

      const hero = document.createElement("div");
      hero.className = "stage-hero";
      hero.style.setProperty("--stage-a", stage.backgroundColor1);
      hero.style.setProperty("--stage-b", stage.backgroundColor2);

      const detail = document.createElement("article");
      detail.className = "stage-detail";
      const title = document.createElement("h3");
      title.textContent = stage.name;
      const concept = document.createElement("p");
      concept.textContent = stage.concept;
      const gimmick = document.createElement("span");
      gimmick.className = "gimmick-pill";
      gimmick.textContent = `GIMMICK: ${stage.gimmickName}`;
      detail.append(title, concept, gimmick);
      this.preview.append(hero, detail);

      stages.forEach((item, index) => {
        const card = document.createElement("article");
        card.className = `stage-card${index === this.selectedIndex ? " active" : ""}`;
        card.addEventListener("click", () => {
          this.selectedIndex = index;
          this.renderStageSelect();
        });
        const cardTitle = document.createElement("h3");
        cardTitle.textContent = item.name;
        const cardText = document.createElement("p");
        cardText.textContent = `${item.gimmickName} / ${item.concept}`;
        card.append(cardTitle, cardText);
        this.cards.append(card);
      });
    }

    drawBackground(ctx) {
      const stage = this.activeStage ?? this.selectedStage;
      const gradient = ctx.createLinearGradient(0, 0, W, H);
      gradient.addColorStop(0, stage.backgroundColor1);
      gradient.addColorStop(1, stage.backgroundColor2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      if (stage.backgroundType === "office") this.drawOffice(ctx);
      if (stage.backgroundType === "campus") this.drawCampus(ctx);
      if (stage.backgroundType === "shopping") this.drawShopping(ctx);
      if (stage.backgroundType === "construction") this.drawConstruction(ctx);
    }

    drawOffice(ctx) {
      ctx.save();
      ctx.fillStyle = "rgba(9, 18, 39, 0.42)";
      for (let i = 0; i < 8; i += 1) {
        const x = 24 + i * 118;
        roundRect(ctx, x, 54 + (i % 2) * 16, 76, 260, 4);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 241, 145, 0.7)";
        for (let row = 0; row < 6; row += 1) {
          for (let col = 0; col < 3; col += 1) {
            if ((row + col + i) % 3 !== 0) ctx.fillRect(x + 12 + col * 19, 76 + row * 34, 10, 14);
          }
        }
        ctx.fillStyle = "rgba(9, 18, 39, 0.42)";
      }
      ctx.fillStyle = "rgba(255,255,255,0.58)";
      roundRect(ctx, 366, 118, 228, 66, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(24,33,47,0.22)";
      roundRect(ctx, 400, 356, 160, 32, 8);
      ctx.fill();
      ctx.restore();
    }

    drawCampus(ctx) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      roundRect(ctx, 78, 70, 240, 165, 8);
      roundRect(ctx, 642, 70, 240, 165, 8);
      ctx.fill();
      ctx.fillStyle = "rgba(22, 93, 72, 0.78)";
      roundRect(ctx, 346, 78, 268, 118, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.68)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(480, 84, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(24,33,47,0.18)";
      for (let i = 0; i < 7; i += 1) {
        roundRect(ctx, 120 + i * 110, 346, 70, 18, 5);
        ctx.fill();
      }
      ctx.restore();
    }

    drawShopping(ctx) {
      ctx.save();
      const shopColors = ["#ef476f", "#06d6a0", "#118ab2", "#f77f00"];
      for (let i = 0; i < 4; i += 1) {
        const x = 40 + i * 230;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        roundRect(ctx, x, 92, 180, 210, 8);
        ctx.fill();
        ctx.fillStyle = shopColors[i];
        roundRect(ctx, x + 16, 120, 148, 42, 6);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.68)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(480, 230, 330, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.fillStyle = "rgba(24,33,47,0.16)";
      ctx.fillRect(0, 430, W, 80);
      ctx.restore();
    }

    drawConstruction(ctx) {
      ctx.save();
      ctx.strokeStyle = "rgba(49, 53, 61, 0.72)";
      ctx.lineWidth = 6;
      for (let i = 0; i < 7; i += 1) {
        const x = 80 + i * 130;
        ctx.beginPath();
        ctx.moveTo(x, 112);
        ctx.lineTo(x + 80, 410);
        ctx.moveTo(x + 80, 112);
        ctx.lineTo(x, 410);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255, 210, 63, 0.9)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(610, 74);
      ctx.lineTo(610, 260);
      ctx.moveTo(610, 74);
      ctx.lineTo(820, 94);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 202, 58, 0.8)";
      roundRect(ctx, 116, 314, 112, 42, 6);
      ctx.fill();
      ctx.fillStyle = "#18212f";
      ctx.font = "900 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("安全第一", 172, 341);
      ctx.restore();
    }

    drawHazards(ctx) {
      for (const hazard of this.hazards) hazard.draw(ctx);
    }

    drawStageInfo(ctx) {
      const stage = this.activeStage;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.86)";
      roundRect(ctx, W - 292, 88, 270, 56, 8);
      ctx.fill();
      ctx.fillStyle = "#18212f";
      ctx.font = "900 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`STAGE: ${stage.name}`, W - 276, 111);
      ctx.fillStyle = "#5d6776";
      ctx.font = "800 12px sans-serif";
      ctx.fillText(`GIMMICK: ${stage.gimmickName}`, W - 276, 132);

      if (this.bannerTimer > 0) {
        ctx.textAlign = "center";
        ctx.font = "900 28px sans-serif";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(24,33,47,0.32)";
        ctx.strokeText(this.bannerText, W / 2, 104);
        ctx.fillStyle = this.bannerColor;
        ctx.fillText(this.bannerText, W / 2, 104);
        if (this.bannerSubText) {
          ctx.font = "800 15px sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(this.bannerSubText, W / 2, 128);
        }
      }
      ctx.restore();
    }
  }

  class CharacterSelect {
    constructor(game) {
      this.game = game;
      this.playerCount = 1;
      this.cursors = [0];
      this.locked = [false];
      this.pageSize = 10;
      this.page = 0;
      this.grid = document.getElementById("characterGrid");
      this.panels = document.getElementById("playerPanels");
      this.countButtons = [...document.querySelectorAll("[data-count]")];
      this.pageStatus = document.getElementById("characterPageStatus");
      this.prevPageButton = document.getElementById("prevCharacterPage");
      this.nextPageButton = document.getElementById("nextCharacterPage");
      this.countButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.setPlayerCount(Number(button.dataset.count));
        });
      });
      this.prevPageButton?.addEventListener("click", () => this.changePage(-1));
      this.nextPageButton?.addEventListener("click", () => this.changePage(1));
      this.render();
    }

    get totalPages() {
      return Math.max(1, Math.ceil(characters.length / this.pageSize));
    }

    get pageStart() {
      return this.page * this.pageSize;
    }

    get pageEnd() {
      return Math.min(characters.length, this.pageStart + this.pageSize);
    }

    reset() {
      this.playerCount = 1;
      this.cursors = [this.cursors[0] ?? 0].map((value) => value % characters.length);
      this.page = Math.floor(this.cursors[0] / this.pageSize);
      this.locked = [false];
      this.render();
    }

    setPlayerCount(count) {
      this.playerCount = 1;
      this.render();
    }

    move(playerIndex, direction) {
      if (playerIndex !== 0 || this.locked[0]) return;
      this.cursors[0] = (this.cursors[0] + direction + characters.length) % characters.length;
      this.page = Math.floor(this.cursors[0] / this.pageSize);
      this.render();
    }

    changePage(direction) {
      const slot = this.cursors[0] % this.pageSize;
      this.page = (this.page + direction + this.totalPages) % this.totalPages;
      this.cursors[0] = Math.min(this.pageStart + slot, characters.length - 1);
      this.locked[0] = false;
      this.render();
    }

    selectIndex(index, lock = false) {
      this.cursors[0] = (index + characters.length) % characters.length;
      this.page = Math.floor(this.cursors[0] / this.pageSize);
      this.locked[0] = Boolean(lock);
      this.render();
    }

    confirm(playerIndex) {
      if (playerIndex !== 0) return;
      this.locked[0] = !this.locked[0];
      this.render();
    }

    canStart() {
      return this.locked[0];
    }

    confirmAllActive() {
      this.locked[0] = true;
      this.render();
    }

    getSelections() {
      return [characters[this.cursors[0]]];
    }

    handleKeyDown(event) {
      if (event.code === localControls.left || event.code === "ArrowLeft") this.move(0, -1);
      if (event.code === localControls.right || event.code === "ArrowRight") this.move(0, 1);
      if (event.code === "KeyQ") this.changePage(-1);
      if (event.code === "KeyE") this.changePage(1);
      if (event.code === "Escape") {
        this.game.gameState = this.game.gameMode === "online" ? "onlineLobby" : "cpuSetup";
        this.game.updateScreens();
        return;
      }
      if (event.code === "Enter") {
        this.confirmAllActive();
        this.game.toStageSelect();
      }
    }

    handleGamepadInput(input) {
      if (!input) return;
      if (input.leftPressed) this.move(0, -1);
      if (input.rightPressed) this.move(0, 1);
      if (input.pageLeftPressed) this.changePage(-1);
      if (input.pageRightPressed) this.changePage(1);
      if (input.confirmPressed) {
        this.confirmAllActive();
        this.game.toStageSelect();
      }
      if (input.backPressed) {
        this.game.gameState = this.game.gameMode === "online" ? "onlineLobby" : "cpuSetup";
        this.game.updateScreens();
      }
    }

    render() {
      this.countButtons.forEach((button) => {
        button.classList.toggle("active", false);
      });

      this.panels.replaceChildren();
      const char = characters[this.cursors[0]];
      const panel = document.createElement("article");
      panel.className = `player-panel${this.locked[0] ? " ready" : ""}`;

      const tag = document.createElement("div");
      tag.className = "player-tag";
      const left = document.createElement("span");
      left.textContent = `P1 ${this.locked[0] ? "決定" : "選択中"}`;
      const chip = document.createElement("span");
      chip.className = "player-chip";
      chip.style.background = PLAYER_COLORS[0];
      tag.append(left, chip);

      const choice = document.createElement("div");
      choice.className = "player-choice";
      const panelPreview = document.createElement("canvas");
      panelPreview.className = "panel-character-preview";
      panelPreview.width = 46;
      panelPreview.height = 62;
      CharacterRenderer.drawPreview(panelPreview.getContext("2d"), char, 23, 57, 0.78, PLAYER_COLORS[0]);
      choice.append(panelPreview);
      const strong = document.createElement("strong");
      strong.textContent = char.name;
      const meta = document.createElement("span");
      meta.textContent = `${char.job} / ${char.archetypeLabel} / ${char.skill}`;
      const ability = document.createElement("span");
      ability.textContent = char.specialAbility ? `${char.specialAbility.name}: ${char.specialAbility.description}` : "";
      choice.append(strong, meta);
      if (ability.textContent) choice.append(ability);

      panel.append(tag, choice);
      this.panels.append(panel);

      const cpuPanel = document.createElement("article");
      cpuPanel.className = "player-panel cpu-summary";
      const cpuTag = document.createElement("div");
      cpuTag.className = "player-tag";
      cpuTag.textContent = this.game.gameMode === "online" ? "オンライン参加者" : "CPU設定";
      const cpuText = document.createElement("p");
      cpuText.className = "cpu-summary-text";
      cpuText.textContent = this.game.gameMode === "online"
        ? "各プレイヤーが自分の端末でキャラを選びます。"
        : `CPU人数: ${this.game.cpuCount} / 難易度: ${this.game.cpuDifficulty}`;
      cpuPanel.append(cpuTag, cpuText);
      this.panels.append(cpuPanel);

      if (this.pageStatus) this.pageStatus.textContent = `Page ${this.page + 1} / ${this.totalPages} (${characters.length}体)`;
      this.prevPageButton?.classList.toggle("active", false);
      this.nextPageButton?.classList.toggle("active", false);

      this.grid.replaceChildren();
      characters.slice(this.pageStart, this.pageEnd).forEach((char, pageIndex) => {
        const index = this.pageStart + pageIndex;
        const card = document.createElement("article");
        card.className = "character-card";
        card.style.setProperty("--card-color", char.color);
        card.addEventListener("click", () => this.selectIndex(index, false));
        card.addEventListener("dblclick", () => {
          this.selectIndex(index, true);
          this.game.toStageSelect();
        });

        const activePlayers = this.cursors[0] === index ? [0] : [];
        if (activePlayers.length > 0) card.classList.add("selected");
        if (activePlayers.some((i) => this.locked[i])) card.classList.add("locked");

        const title = document.createElement("h3");
        title.textContent = char.name;
        const preview = document.createElement("canvas");
        preview.className = "character-preview";
        preview.width = 72;
        preview.height = 78;
        CharacterRenderer.drawPreview(preview.getContext("2d"), char, 36, 70, 0.92, activePlayers.length > 0 ? PLAYER_COLORS[activePlayers[0]] : char.color);
        const job = document.createElement("p");
        job.className = "job";
        job.textContent = `${char.job} / ${char.archetypeLabel}`;
        const concept = document.createElement("p");
        concept.className = "concept";
        concept.textContent = char.selectDescription ?? char.concept;
        const special = document.createElement("p");
        special.className = "special-ability";
        special.textContent = char.specialAbility ? `${char.specialAbility.name}: ${char.specialAbility.description}` : "";
        const moves = document.createElement("p");
        moves.className = "move-list";
        moves.textContent = `道具: ${char.tools.join("・")} / K: ${char.normalAttack} / 空中+方向+K: 空中技 / L: ${char.strongAttack} / L長押し: スマッシュため / W+K: ${char.upAttack} / S+K: ${char.downAttack} / U: つかみ投げ / H: ${char.skill} / J: ${char.ultimate.name}`;
        const selectors = document.createElement("div");
        selectors.className = "selectors";

        activePlayers.forEach((playerIndex) => {
          const dot = document.createElement("span");
          dot.className = "selector-dot";
          dot.style.setProperty("--dot-color", PLAYER_COLORS[playerIndex]);
          dot.textContent = `P${playerIndex + 1}${this.locked[playerIndex] ? "✓" : ""}`;
          selectors.append(dot);
        });

        card.append(preview, title, job, concept, special, moves, selectors);
        this.grid.append(card);
      });
    }
  }

  class Game {
    constructor() {
      this.gameState = "modeSelect";
      this.gameMode = "cpu";
      this.cpuCount = 1;
      this.cpuDifficulty = "Normal";
      this.stockCount = STARTING_STOCKS;
      this.players = [];
      this.controllers = [];
      this.stageManager = new StageManager(this);
      this.platforms = this.stageManager.createPlatforms();
      this.hitboxes = [];
      this.projectiles = [];
      this.skillEffects = [];
      this.attackEffects = [];
      this.particles = [];
      this.items = [];
      this.itemSpawnTimer = 7;
      this.keys = new Set();
      this.pressedKeys = new Set();
      this.touchHeld = new Set();
      this.touchPressed = new Set();
      this.touchPointers = new Map();
      this.debug = false;
      this.lastTime = performance.now();
      this.fps = 0;
      this.frameCounter = 0;
      this.fpsTimer = 0;
      this.screenShake = 0;
      this.freezeFrameTimer = 0;
      this.winner = null;
      this.characterSelect = new CharacterSelect(this);
      this.gamepadPrevious = new Map();
      this.gamepadPressed = new Map();
      this.menuAxisHeld = { left: false, right: false };
      this.socket = null;
      this.onlineRoom = null;
      this.onlinePlayerIndex = 0;
      this.onlineIsHost = false;
      this.onlinePlayers = [];
      this.networkInputs = new Map();
      this.lastOnlineInputSent = 0;
      this.lastOnlineSnapshotSent = 0;
      this.lastOnlinePlayerStateSent = 0;
      this.onlineConnectionState = "connecting";
      this.onlineLastError = "";
      this.bindEvents();
      this.initOnline();
      this.updateScreens();
      requestAnimationFrame((time) => this.loop(time));
    }

    bindEvents() {
      document.getElementById("startButton").addEventListener("click", () => this.toCpuSetup());
      document.getElementById("onlineModeButton")?.addEventListener("click", () => this.toOnlineLobby());
      document.getElementById("restartButton").addEventListener("click", () => this.resetToTitle());
      document.getElementById("toStageButton").addEventListener("click", () => {
        this.characterSelect.confirmAllActive();
        this.toStageSelect();
      });
      document.getElementById("cpuToCharacterButton")?.addEventListener("click", () => this.toSelect("cpu"));
      document.querySelectorAll("[data-cpu-count]").forEach((button) => {
        button.addEventListener("click", () => {
          this.cpuCount = Number(button.dataset.cpuCount);
          this.updateCpuSetupUI();
        });
      });
      document.querySelectorAll("[data-cpu-difficulty]").forEach((button) => {
        button.addEventListener("click", () => {
          this.cpuDifficulty = button.dataset.cpuDifficulty;
          this.updateCpuSetupUI();
        });
      });
      document.querySelectorAll("[data-stocks]").forEach((button) => {
        button.addEventListener("click", () => {
          this.stockCount = Number(button.dataset.stocks);
          this.updateStageRulesUI();
        });
      });
      document.getElementById("createRoomButton")?.addEventListener("click", () => this.createOnlineRoom());
      document.getElementById("joinRoomButton")?.addEventListener("click", () => {
        const input = document.getElementById("roomIdInput");
        this.joinOnlineRoom(input?.value?.trim() ?? "");
      });
      document.getElementById("onlineCharacterSelect")?.addEventListener("change", (event) => this.selectOnlineCharacter(event.target.value));
      document.getElementById("onlineStageSelect")?.addEventListener("change", (event) => this.selectOnlineStage(event.target.value));
      document.getElementById("onlineStockSelect")?.addEventListener("change", (event) => this.selectOnlineStocks(Number(event.target.value)));
      document.getElementById("onlineReadyButton")?.addEventListener("click", () => this.toggleOnlineReady());
      document.getElementById("onlineStartButton")?.addEventListener("click", () => this.startOnlineGame());
      document.getElementById("onlineBackButton")?.addEventListener("click", () => this.resetToTitle());

      window.addEventListener("keydown", (event) => {
        if (isGameKey(event.code)) event.preventDefault();
        if (!this.keys.has(event.code)) this.pressedKeys.add(event.code);
        this.keys.add(event.code);

        if (event.code === "F1") {
          event.preventDefault();
          this.debug = !this.debug;
          return;
        }
        if (event.code === "KeyR") {
          this.resetToTitle();
          return;
        }
        if (this.gameState === "modeSelect") {
          if (event.code === "Digit1" || event.code === "Enter") this.toCpuSetup();
          if (event.code === "Digit2") this.toOnlineLobby();
          return;
        }
        if (this.gameState === "cpuSetup") {
          this.handleCpuSetupKeyDown(event);
          return;
        }
        if (this.gameState === "characterSelect") {
          this.characterSelect.handleKeyDown(event);
          return;
        }
        if (this.gameState === "stageSelect") {
          this.handleStageSelectKeyDown(event);
        }
      });

      window.addEventListener("keyup", (event) => {
        this.keys.delete(event.code);
      });

      this.bindTouchControls();
    }

    bindTouchControls() {
      const root = document.getElementById("touchControls");
      if (!root) return;
      root.addEventListener("contextmenu", (event) => event.preventDefault());

      root.querySelectorAll("[data-touch-action]").forEach((button) => {
        const action = button.dataset.touchAction;
        if (!action) return;

        const press = (event) => {
          event.preventDefault();
          button.setPointerCapture?.(event.pointerId);
          this.touchPointers.set(event.pointerId, action);
          if (!this.touchHeld.has(action)) this.touchPressed.add(action);
          this.touchHeld.add(action);
          button.classList.add("is-active");
        };

        const release = (event) => {
          event.preventDefault();
          this.touchPointers.delete(event.pointerId);
          let stillHeld = false;
          for (const heldAction of this.touchPointers.values()) {
            if (heldAction === action) {
              stillHeld = true;
              break;
            }
          }
          if (!stillHeld) {
            this.touchHeld.delete(action);
            button.classList.remove("is-active");
          }
        };

        button.addEventListener("pointerdown", press, { passive: false });
        button.addEventListener("pointerup", release, { passive: false });
        button.addEventListener("pointercancel", release, { passive: false });
        button.addEventListener("lostpointercapture", release, { passive: false });
      });
    }

    createBasePlatforms() {
      return this.stageManager.createPlatforms();
    }

    toCpuSetup() {
      this.gameMode = "cpu";
      this.gameState = "cpuSetup";
      this.updateCpuSetupUI();
      this.updateScreens();
    }

    toSelect(mode = this.gameMode) {
      this.gameMode = mode;
      this.gameState = "characterSelect";
      this.characterSelect.reset();
      this.updateScreens();
    }

    toStageSelect() {
      this.gameState = "stageSelect";
      this.stageManager.renderStageSelect();
      this.updateStageRulesUI();
      this.updateScreens();
    }

    resetToTitle() {
      if (this.onlineRoom && this.socket?.connected) {
        this.socket.emit("leaveRoom", { roomId: this.onlineRoom.id });
      }
      this.gameState = "modeSelect";
      this.gameMode = "cpu";
      this.players = [];
      this.controllers = [];
      this.hitboxes = [];
      this.projectiles = [];
      this.skillEffects = [];
      this.attackEffects = [];
      this.particles = [];
      this.items = [];
      this.itemSpawnTimer = 7;
      this.stageManager.reset();
      this.platforms = this.stageManager.createPlatforms();
      this.winner = null;
      this.onlineRoom = null;
      this.onlinePlayers = [];
      this.onlineIsHost = false;
      this.networkInputs.clear();
      this.characterSelect.reset();
      this.updateScreens();
      this.renderOnlineLobby();
    }

    handleStageSelectKeyDown(event) {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.stageManager.selectNext(-1);
        return;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        this.stageManager.selectNext(1);
        return;
      }
      if (event.code === "Escape") {
        this.gameState = "characterSelect";
        this.updateScreens();
        return;
      }
      if (event.code === "Enter") {
        this.startMatch();
      }
    }

    startMatch() {
      const selections = this.buildMatchSelections();
      this.stageManager.startSelectedStage();
      const spawnPoints = this.stageManager.activeStage.spawnPoints;
      this.players = selections.map((character, index) => new Player(
        index,
        character,
        spawnPoints[index].x,
        spawnPoints[index].y,
        PLAYER_COLORS[index],
        this.stockCount
      ));
      this.setupControllers();
      this.hitboxes = [];
      this.projectiles = [];
      this.skillEffects = [];
      this.attackEffects = [];
      this.particles = [];
      this.items = [];
      this.itemSpawnTimer = 5.5 + Math.random() * 3.5;
      this.platforms = this.stageManager.createPlatforms();
      this.winner = null;
      this.gameState = "playing";
      this.updateScreens();
      this.updateHUD();
    }

    buildMatchSelections() {
      const selections = this.characterSelect.getSelections();
      if (this.gameMode !== "cpu") return selections;
      const targetCount = clamp(1 + this.cpuCount, 2, 4);
      const picked = new Set(selections.map((character) => character.id));
      while (selections.length < targetCount) {
        const pool = characters.filter((character) => !picked.has(character.id));
        const next = pool[Math.floor(Math.random() * pool.length)] ?? characters[Math.floor(Math.random() * characters.length)];
        selections.push(next);
        picked.add(next.id);
      }
      return selections;
    }

    setupControllers() {
      this.controllers = this.players.map((player, index) => {
        if (this.gameMode === "online") {
          const isLocal = index === this.onlinePlayerIndex;
          player.controllerType = isLocal ? "local" : "online";
          return isLocal ? new KeyboardController(this) : new NetworkController(this, index);
        }
        if (index === 0) {
          player.controllerType = "local";
          return new KeyboardController(this);
        }
        player.controllerType = "cpu";
        return new CPUController(player, this, this.cpuDifficulty);
      });
    }

    handleCpuSetupKeyDown(event) {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.cpuCount = clamp(this.cpuCount - 1, 1, 3);
        this.updateCpuSetupUI();
        return;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        this.cpuCount = clamp(this.cpuCount + 1, 1, 3);
        this.updateCpuSetupUI();
        return;
      }
      if (event.code === "Digit1" || event.code === "Digit2" || event.code === "Digit3") {
        this.cpuCount = Number(event.code.replace("Digit", ""));
        this.updateCpuSetupUI();
        return;
      }
      if (event.code === "KeyQ" || event.code === "KeyW" || event.code === "KeyE") {
        const map = { KeyQ: "Easy", KeyW: "Normal", KeyE: "Hard" };
        this.cpuDifficulty = map[event.code];
        this.updateCpuSetupUI();
        return;
      }
      if (event.code === "Enter") {
        this.toSelect("cpu");
        return;
      }
      if (event.code === "Escape") {
        this.resetToTitle();
      }
    }

    updateCpuSetupUI() {
      document.querySelectorAll("[data-cpu-count]").forEach((button) => {
        button.classList.toggle("active", Number(button.dataset.cpuCount) === this.cpuCount);
      });
      document.querySelectorAll("[data-cpu-difficulty]").forEach((button) => {
        button.classList.toggle("active", button.dataset.cpuDifficulty === this.cpuDifficulty);
      });
      const summary = document.getElementById("cpuSetupSummary");
      if (summary) summary.textContent = `P1 + CPU${this.cpuCount}体 / 難易度 ${this.cpuDifficulty}`;
    }

    updateStageRulesUI() {
      document.querySelectorAll("[data-stocks]").forEach((button) => {
        button.classList.toggle("active", Number(button.dataset.stocks) === this.stockCount);
      });
      const label = document.getElementById("stockRuleLabel");
      if (label) label.textContent = `残機数: ${this.stockCount}`;
    }

    initOnline() {
      this.populateOnlineLobbyControls();
      if (!window.io) {
        this.onlineConnectionState = "failed";
        this.setOnlineStatus("Socket.IO未接続: npm install後にnpm startで起動してください。", true);
        this.updateOnlineDebugPanel();
        return;
      }
      this.socket = window.io();
      console.info("[online] connecting with same-origin Socket.IO");
      this.socket.on("connect", () => {
        console.info("[online] connected", this.socket.id);
        this.onlineConnectionState = "connected";
        this.setOnlineStatus("サーバー接続済み");
        this.updateOnlineDebugPanel();
      });
      this.socket.on("online-status", (payload) => {
        console.info("[online] status", payload);
        this.onlineConnectionState = payload?.connected ? "connected" : this.onlineConnectionState;
        this.setOnlineStatus(payload?.message || "サーバー接続済み");
        this.updateOnlineDebugPanel();
      });
      this.socket.on("connect_error", (error) => {
        console.error("[online] connect_error", error);
        this.onlineConnectionState = "failed";
        this.setOnlineStatus(`サーバー接続失敗: ${error?.message || "unknown"}`, true);
        this.updateOnlineDebugPanel();
      });
      this.socket.on("reconnect_attempt", (attempt) => {
        console.info("[online] reconnect_attempt", attempt);
        this.onlineConnectionState = "reconnecting";
        this.setOnlineStatus(`サーバー再接続中... ${attempt}`);
        this.updateOnlineDebugPanel();
      });
      this.socket.on("disconnect", (reason) => {
        console.warn("[online] disconnected", reason);
        this.onlineConnectionState = "disconnected";
        this.setOnlineStatus(`オンラインサーバーから切断されました: ${reason}`, true);
        this.updateOnlineDebugPanel();
      });
      this.socket.on("roomCreated", (payload) => this.handleOnlineJoined(payload));
      this.socket.on("room-created", (payload) => this.handleOnlineJoined(payload));
      this.socket.on("roomJoined", (payload) => this.handleOnlineJoined(payload));
      this.socket.on("room-joined", (payload) => this.handleOnlineJoined(payload));
      this.socket.on("roomUpdated", (room) => this.handleOnlineRoomUpdate(room));
      this.socket.on("room-update", (room) => this.handleOnlineRoomUpdate(room));
      this.socket.on("roomInputs", (payload) => this.handleOnlineInputs(payload));
      this.socket.on("room-inputs", (payload) => this.handleOnlineInputs(payload));
      this.socket.on("onlineStart", (payload) => this.handleOnlineStart(payload));
      this.socket.on("online-start", (payload) => this.handleOnlineStart(payload));
      this.socket.on("gameStateSnapshot", (payload) => this.applyOnlineSnapshot(payload));
      this.socket.on("game-state", (payload) => this.applyOnlineSnapshot(payload));
      this.socket.on("enemy-state", (payload) => this.handleEnemyState(payload));
      this.socket.on("combat-event", (payload) => this.handleCombatEvent(payload));
      this.socket.on("opponentDisconnected", (payload) => this.handleOnlineDisconnectNotice(payload));
      this.socket.on("player-disconnected", (payload) => this.handleOnlineDisconnectNotice(payload));
      this.socket.on("onlineError", (message) => this.handleOnlineError(message));
      this.socket.on("online-error", (payload) => this.handleOnlineError(payload?.message || payload));
    }

    populateOnlineLobbyControls() {
      const characterSelect = document.getElementById("onlineCharacterSelect");
      if (characterSelect && characterSelect.children.length === 0) {
        for (const character of characters) {
          const option = document.createElement("option");
          option.value = character.id;
          option.textContent = `${character.name} / ${character.job}`;
          characterSelect.append(option);
        }
      }
      const stageSelect = document.getElementById("onlineStageSelect");
      if (stageSelect && stageSelect.children.length === 0) {
        for (const stage of stages) {
          const option = document.createElement("option");
          option.value = stage.id;
          option.textContent = stage.name;
          stageSelect.append(option);
        }
      }
      const stockSelect = document.getElementById("onlineStockSelect");
      if (stockSelect && stockSelect.children.length === 0) {
        for (const count of [1, 2, 3, 4, 5]) {
          const option = document.createElement("option");
          option.value = String(count);
          option.textContent = `${count}機`;
          stockSelect.append(option);
        }
        stockSelect.value = String(this.stockCount);
      }
    }

    toOnlineLobby() {
      this.gameMode = "online";
      this.gameState = "onlineLobby";
      this.populateOnlineLobbyControls();
      this.renderOnlineLobby();
      this.updateScreens();
    }

    setOnlineStatus(text, isError = false) {
      this.onlineLastError = isError ? text : "";
      const status = document.getElementById("onlineStatus");
      if (status) status.textContent = text;
      const error = document.getElementById("onlineErrorText");
      if (error) error.textContent = isError ? text : "";
      this.updateOnlineDebugPanel();
    }

    updateOnlineDebugPanel() {
      const connection = document.getElementById("onlineConnectionState");
      if (connection) {
        const labels = {
          connecting: "接続中",
          connected: "接続済み",
          reconnecting: "再接続中",
          disconnected: "切断",
          failed: "失敗"
        };
        connection.textContent = labels[this.onlineConnectionState] || this.onlineConnectionState || "---";
      }
      const socketId = document.getElementById("onlineSocketId");
      if (socketId) socketId.textContent = this.socket?.id || "---";
      const roomId = document.getElementById("onlineRoomDebug");
      if (roomId) roomId.textContent = this.onlineRoom?.id || "---";
      const count = document.getElementById("onlinePlayerCount");
      if (count) {
        const max = this.onlineRoom?.maxPlayers || 4;
        count.textContent = `${this.onlinePlayers.length} / ${max}`;
      }
    }

    createOnlineRoom() {
      if (!this.socket?.connected) {
        this.setOnlineStatus("サーバー未接続です。npm install後にnpm startで起動してください。");
        return;
      }
      const characterId = document.getElementById("onlineCharacterSelect")?.value ?? characters[0].id;
      console.info("[online] createRoom", { characterId, stageId: stages[this.stageManager.selectedIndex].id, stocks: this.stockCount });
      this.socket.emit("createRoom", {
        characterId,
        stageId: stages[this.stageManager.selectedIndex].id,
        stocks: this.stockCount
      });
    }

    joinOnlineRoom(roomId) {
      if (!this.socket?.connected) {
        this.setOnlineStatus("サーバー未接続です。");
        return;
      }
      if (!roomId) {
        this.setOnlineStatus("ルームIDを入力してください。");
        return;
      }
      const characterId = document.getElementById("onlineCharacterSelect")?.value ?? characters[0].id;
      console.info("[online] joinRoom", { roomId, characterId });
      this.socket.emit("joinRoom", { roomId, characterId });
    }

    handleOnlineJoined(payload) {
      console.info("[online] joined", payload);
      this.onlineRoom = payload.room;
      this.onlinePlayerIndex = payload.playerIndex;
      this.onlineIsHost = Boolean(payload.isHost);
      this.handleOnlineRoomUpdate(payload.room);
      this.setOnlineStatus(`ルーム ${payload.room.id} に参加しました。`);
    }

    handleOnlineRoomUpdate(room) {
      console.info("[online] roomUpdated", room);
      this.onlineRoom = room;
      this.onlinePlayers = room.players ?? [];
      const self = this.onlinePlayers.find((player) => player.socketId === this.socket?.id);
      if (self) {
        this.onlinePlayerIndex = self.index;
        this.onlineIsHost = Boolean(self.isHost);
      }
      if (room.settings) {
        const stageIndex = stages.findIndex((stage) => stage.id === room.settings.stageId);
        if (stageIndex >= 0) this.stageManager.selectedIndex = stageIndex;
        this.stockCount = room.settings.stocks ?? this.stockCount;
        const stageSelect = document.getElementById("onlineStageSelect");
        if (stageSelect) stageSelect.value = stages[this.stageManager.selectedIndex].id;
        const stockSelect = document.getElementById("onlineStockSelect");
        if (stockSelect) stockSelect.value = String(this.stockCount);
      }
      this.renderOnlineLobby();
      this.updateOnlineDebugPanel();
    }

    renderOnlineLobby() {
      const roomId = document.getElementById("roomIdDisplay");
      if (roomId) roomId.textContent = this.onlineRoom?.id ? `ルームID: ${this.onlineRoom.id}` : "ルーム未参加";
      const list = document.getElementById("onlinePlayerList");
      if (list) {
        list.replaceChildren();
        const players = this.onlinePlayers.length > 0 ? this.onlinePlayers : [];
        if (players.length === 0) {
          const empty = document.createElement("li");
          empty.textContent = "まだ参加者はいません。";
          list.append(empty);
        }
        for (const player of players) {
          const character = characters.find((item) => item.id === player.characterId) ?? characters[0];
          const item = document.createElement("li");
          item.textContent = `P${player.index + 1} ${character.name} ${player.ready ? "準備OK" : "準備中"}${player.isHost ? " / ホスト" : ""}`;
          list.append(item);
        }
      }
      const startButton = document.getElementById("onlineStartButton");
      if (startButton) startButton.disabled = !this.onlineIsHost || !this.onlineRoom || this.onlinePlayers.length < 2;
      const hostControls = document.querySelectorAll(".host-only");
      hostControls.forEach((node) => node.classList.toggle("disabled", !this.onlineIsHost));
      this.updateOnlineDebugPanel();
    }

    handleOnlineError(message) {
      const text = String(message || "オンラインエラーが発生しました。");
      console.error("[online] error", text);
      this.setOnlineStatus(text, true);
    }

    handleOnlineDisconnectNotice(payload = {}) {
      console.warn("[online] player disconnected", payload);
      const text = payload.message || "相手が切断しました。";
      this.setOnlineStatus(text, true);
      if (this.gameState === "playing") {
        this.spawnText(text, W / 2, 86, "#ffb3b3", 1.2, 22);
      }
    }

    handleEnemyState(payload = {}) {
      if (!payload?.state || this.gameMode !== "online" || this.gameState !== "playing") return;
      if (this.onlineIsHost) return;
      const state = payload.state;
      if (state.id === this.onlinePlayerIndex || state.playerIndex === this.onlinePlayerIndex) return;
      const player = this.players.find((item) => item.id === state.id || item.id === state.playerIndex);
      if (!player) return;
      player.x = state.x ?? player.x;
      player.y = state.y ?? player.y;
      player.prevX = player.x;
      player.prevY = player.y;
      player.vx = state.vx ?? player.vx;
      player.vy = state.vy ?? player.vy;
      player.facing = state.direction ?? state.facing ?? player.facing;
      player.damage = state.damage ?? player.damage;
      player.stocks = state.stocks ?? player.stocks;
      player.state = state.state ?? player.state;
      player.visualState = player.state;
      player.eliminated = Boolean(state.isOut ?? state.eliminated ?? player.eliminated);
      console.debug("[online] enemy-state", payload);
    }

    handleCombatEvent(payload = {}) {
      if (payload.type) console.debug("[online] combat-event", payload);
      if (this.gameState !== "playing") return;
      const player = this.players.find((item) => item.id === payload.playerIndex);
      if (!player) return;
      const labels = {
        normal: "通常攻撃",
        strong: "重攻撃",
        skill: "必殺技",
        ultimate: "必殺技",
        grabbed: "つかみ",
        dodge: "緊急回避",
        hit: payload.label || "ヒット",
        ko: "撃墜"
      };
      const label = labels[payload.type] || payload.label;
      const target = this.players.find((item) => item.id === payload.targetId) ?? player;
      if (label) this.spawnText(label, target.centerX, target.y - 24, payload.type === "ko" ? "#d5382f" : "#7ed3ff", 0.45, 16);
    }

    selectOnlineCharacter(characterId) {
      if (!this.onlineRoom || !this.socket?.connected) return;
      this.socket.emit("selectCharacter", { roomId: this.onlineRoom.id, characterId });
    }

    selectOnlineStage(stageId) {
      if (!this.onlineRoom || !this.onlineIsHost || !this.socket?.connected) return;
      this.socket.emit("selectStage", { roomId: this.onlineRoom.id, stageId });
    }

    selectOnlineStocks(stocks) {
      if (!this.onlineRoom || !this.onlineIsHost || !this.socket?.connected) return;
      this.socket.emit("selectStocks", { roomId: this.onlineRoom.id, stocks });
    }

    toggleOnlineReady() {
      if (!this.onlineRoom || !this.socket?.connected) return;
      this.socket.emit("toggleReady", { roomId: this.onlineRoom.id });
    }

    startOnlineGame() {
      if (!this.onlineRoom || !this.onlineIsHost || !this.socket?.connected) return;
      console.info("[online] startGame", { roomId: this.onlineRoom.id, players: this.onlinePlayers });
      this.socket.emit("startGame", { roomId: this.onlineRoom.id });
    }

    handleOnlineInputs(payload) {
      if (!payload?.inputs) return;
      this.networkInputs.clear();
      Object.entries(payload.inputs).forEach(([index, input]) => {
        this.networkInputs.set(Number(index), normalizeInput(input));
      });
    }

    handleOnlineStart(payload) {
      console.info("[online] start", payload);
      const room = payload.room;
      this.onlineRoom = room;
      this.onlinePlayers = room.players ?? [];
      this.networkInputs.clear();
      this.lastOnlineInputSent = 0;
      this.lastOnlineSnapshotSent = 0;
      this.lastOnlinePlayerStateSent = 0;
      this.gameMode = "online";
      this.stockCount = room.settings?.stocks ?? STARTING_STOCKS;
      const stageIndex = stages.findIndex((stage) => stage.id === room.settings?.stageId);
      this.stageManager.selectedIndex = stageIndex >= 0 ? stageIndex : 0;
      this.stageManager.startSelectedStage();
      const spawnPoints = this.stageManager.activeStage.spawnPoints;
      const ordered = [...this.onlinePlayers].sort((a, b) => a.index - b.index);
      this.players = ordered.map((entry) => {
        const character = characters.find((item) => item.id === entry.characterId) ?? characters[0];
        return new Player(entry.index, character, spawnPoints[entry.index].x, spawnPoints[entry.index].y, PLAYER_COLORS[entry.index], this.stockCount);
      });
      this.setupControllers();
      this.hitboxes = [];
      this.projectiles = [];
      this.skillEffects = [];
      this.attackEffects = [];
      this.particles = [];
      this.items = [];
      this.itemSpawnTimer = 5.5 + Math.random() * 3.5;
      this.platforms = this.stageManager.createPlatforms();
      this.winner = null;
      this.gameState = "playing";
      this.updateScreens();
      this.updateHUD();
    }

    sendOnlineInput(dt) {
      if (!this.socket?.connected || !this.onlineRoom) return;
      this.lastOnlineInputSent += dt;
      const input = normalizeInput(this.controllers[this.onlinePlayerIndex]?.currentInput);
      if (input.jumpPressed || input.normalPressed || input.strongPressed || input.grabPressed || input.skillPressed || input.ultimatePressed || input.dodgePressed || input.guardHeld || this.lastOnlineInputSent >= 1 / 30) {
        this.lastOnlineInputSent = 0;
        this.socket.emit("playerInput", { roomId: this.onlineRoom.id, input });
        this.emitOnlineCombatInput(input);
      }
    }

    emitOnlineCombatInput(input) {
      if (!this.socket?.connected || !this.onlineRoom) return;
      let type = "";
      if (input.normalPressed) type = "normal";
      else if (input.strongPressed) type = "strong";
      else if (input.skillPressed) type = "skill";
      else if (input.ultimatePressed) type = "ultimate";
      else if (input.grabPressed) type = "grabbed";
      else if (input.dodgePressed) type = "dodge";
      if (!type) return;
      this.socket.emit("combat-event", {
        roomId: this.onlineRoom.id,
        type,
        at: performance.now()
      });
    }

    emitOnlineCombatAction(type, details = {}) {
      if (!this.socket?.connected || !this.onlineRoom || this.gameMode !== "online") return;
      this.socket.emit("combat-event", {
        roomId: this.onlineRoom.id,
        type,
        ...details,
        at: performance.now()
      });
    }

    sendOnlinePlayerState(dt) {
      if (!this.socket?.connected || !this.onlineRoom || this.gameState !== "playing") return;
      this.lastOnlinePlayerStateSent += dt;
      if (this.lastOnlinePlayerStateSent < 1 / 20) return;
      this.lastOnlinePlayerStateSent = 0;
      const player = this.players.find((item) => item.id === this.onlinePlayerIndex);
      if (!player) return;
      this.socket.emit("player-state", {
        roomId: this.onlineRoom.id,
        state: this.createPlayerNetworkState(player)
      });
    }

    sendOnlineSnapshot(dt) {
      if (!this.socket?.connected || !this.onlineRoom) return;
      this.lastOnlineSnapshotSent += dt;
      if (this.lastOnlineSnapshotSent < 1 / 20 && this.gameState === "playing") return;
      this.lastOnlineSnapshotSent = 0;
      this.socket.emit("gameStateUpdate", this.createNetworkState());
    }

    createPlayerNetworkState(player) {
      return {
        id: player.id,
        playerIndex: player.id,
        characterId: player.selectedCharacter.id,
        x: Number(player.x.toFixed(2)),
        y: Number(player.y.toFixed(2)),
        vx: Number(player.vx.toFixed(2)),
        vy: Number(player.vy.toFixed(2)),
        direction: player.facing,
        facing: player.facing,
        state: player.state,
        animationState: player.visualState,
        damage: Number(player.damage.toFixed(1)),
        hp: Math.max(0, player.stocks),
        stocks: player.stocks,
        alive: !player.eliminated,
        guardMeter: Number(player.guardMeter.toFixed(1)),
        isGuarding: player.isGuarding,
        guardJustTimer: Number(player.guardJustTimer.toFixed(2)),
        guardBreakTimer: Number(player.guardBreakTimer.toFixed(2)),
        dodgeTimer: Number(player.dodgeTimer.toFixed(2)),
        dodgeCooldownTimer: Number(player.dodgeCooldownTimer.toFixed(2)),
        hitStopTimer: Number(player.hitStopTimer.toFixed(2)),
        hitStun: Number(player.hitStun.toFixed(2)),
        grabbedById: player.grabbedBy?.id ?? null,
        grabbedTargetId: player.grabbedTarget?.id ?? null,
        ledgeHangTimer: Number(player.ledgeHangTimer.toFixed(2)),
        ledgeSide: player.ledgeSide,
        isChargingSmash: player.isChargingSmash,
        smashChargeTimer: Number(player.smashChargeTimer.toFixed(2)),
        ultimateCooldownTimer: Number(player.ultimateCooldownTimer.toFixed(2)),
        isUsingUltimate: player.isUsingUltimate,
        ultimatePhase: player.ultimatePhase,
        ultimateTimer: Number(player.ultimateTimer.toFixed(2)),
        isOut: player.eliminated
      };
    }

    createNetworkState() {
      return {
        roomId: this.onlineRoom?.id,
        players: this.players.map((player) => this.createPlayerNetworkState(player)),
        projectiles: this.projectiles.map((projectile) => projectile.toNetworkState()),
        items: this.items.map((item) => ({
          type: item.type,
          x: Number(item.x.toFixed(1)),
          y: Number(item.y.toFixed(1)),
          vx: Number(item.vx.toFixed(2)),
          vy: Number(item.vy.toFixed(2)),
          life: Number(item.life.toFixed(2))
        })),
        attackEffects: this.attackEffects.map((effect) => effect.toNetworkState()),
        effects: this.skillEffects.map((effect) => ({
          type: effect.type,
          x: Math.round(effect.x),
          y: Math.round(effect.y),
          width: effect.width,
          height: effect.height,
          label: effect.label,
          color: effect.color
        })),
        stageId: this.stageManager.activeStage.id,
        gameTime: performance.now(),
        gameState: this.gameState,
        winnerId: this.winner?.id ?? null
      };
    }

    applyOnlineSnapshot(snapshot) {
      if (!snapshot || this.onlineIsHost) return;
      if (snapshot.stageId) {
        const stageIndex = stages.findIndex((stage) => stage.id === snapshot.stageId);
        if (stageIndex >= 0 && this.stageManager.activeStage.id !== snapshot.stageId) {
          this.stageManager.selectedIndex = stageIndex;
          this.stageManager.startSelectedStage();
          this.platforms = this.stageManager.createPlatforms();
        }
      }
      if (Array.isArray(snapshot.players)) {
        for (const data of snapshot.players) {
          let player = this.players.find((item) => item.id === data.id);
          if (!player) {
            const character = characters.find((item) => item.id === data.characterId) ?? characters[0];
            player = new Player(data.id, character, data.x, data.y, PLAYER_COLORS[data.id], data.stocks ?? this.stockCount);
            player.controllerType = data.id === this.onlinePlayerIndex ? "local" : "online";
            this.players.push(player);
          }
          player.x = data.x;
          player.y = data.y;
          player.prevX = data.x;
          player.prevY = data.y;
          player.vx = data.vx;
          player.vy = data.vy;
          player.damage = data.damage;
          player.stocks = data.stocks;
          player.facing = data.direction ?? data.facing;
          player.state = data.state;
          player.visualState = data.state;
          player.guardMeter = data.guardMeter ?? player.guardMeter;
          player.isGuarding = Boolean(data.isGuarding);
          player.guardJustTimer = data.guardJustTimer ?? player.guardJustTimer;
          player.guardBreakTimer = data.guardBreakTimer ?? player.guardBreakTimer;
          player.dodgeTimer = data.dodgeTimer ?? player.dodgeTimer;
          player.dodgeCooldownTimer = data.dodgeCooldownTimer ?? player.dodgeCooldownTimer;
          player.hitStopTimer = data.hitStopTimer ?? player.hitStopTimer;
          player.hitStun = data.hitStun ?? player.hitStun;
          player.ledgeHangTimer = data.ledgeHangTimer ?? player.ledgeHangTimer;
          player.ledgeSide = data.ledgeSide ?? player.ledgeSide;
          player.isChargingSmash = Boolean(data.isChargingSmash);
          player.smashChargeTimer = data.smashChargeTimer ?? player.smashChargeTimer;
          player.grabbedBy = null;
          player.grabbedTarget = null;
          player.ultimateCooldownTimer = data.ultimateCooldownTimer ?? player.ultimateCooldownTimer;
          player.isUsingUltimate = Boolean(data.isUsingUltimate);
          player.ultimatePhase = data.ultimatePhase ?? "";
          player.ultimateTimer = data.ultimateTimer ?? 0;
          player.eliminated = Boolean(data.isOut ?? data.eliminated ?? data.alive === false);
        }
        for (const data of snapshot.players) {
          const player = this.players.find((item) => item.id === data.id);
          if (!player) continue;
          if (data.grabbedById !== null && data.grabbedById !== undefined) {
            player.grabbedBy = this.players.find((item) => item.id === data.grabbedById) ?? null;
          }
          if (data.grabbedTargetId !== null && data.grabbedTargetId !== undefined) {
            player.grabbedTarget = this.players.find((item) => item.id === data.grabbedTargetId) ?? null;
          }
        }
      }
      if (Array.isArray(snapshot.projectiles)) {
        this.projectiles = snapshot.projectiles.map((data) => new Projectile({
          owner: null,
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
          vx: data.vx,
          vy: data.vy,
          duration: 0.35,
          damage: 0,
          baseKnockback: 0,
          label: data.label,
          color: data.color,
          kind: data.kind
        }));
      }
      if (Array.isArray(snapshot.items)) {
        this.items = snapshot.items.map((data) => {
          const item = new BattleItem(data.type, data.x, data.y);
          item.vx = data.vx ?? 0;
          item.vy = data.vy ?? 0;
          item.life = data.life ?? item.life;
          return item;
        });
      }
      if (Array.isArray(snapshot.attackEffects)) {
        this.attackEffects = snapshot.attackEffects.map((data) => new AttackEffect({
          x: data.x,
          y: data.y,
          vx: data.vx,
          vy: data.vy,
          type: data.type,
          ownerId: data.ownerId,
          duration: data.duration,
          scale: data.scale,
          rotation: data.rotation,
          color: data.color,
          data: data.data ?? {}
        }));
      }
      if (snapshot.gameState === "gameover" && this.gameState !== "gameover") {
        const winner = this.players.find((player) => player.id === snapshot.winnerId) ?? null;
        this.finishMatch(winner);
      }
      this.updateHUD();
    }

    updateScreens() {
      const isPlaying = this.gameState === "playing";
      document.getElementById("titleScreen").classList.toggle("hidden", this.gameState !== "modeSelect");
      document.getElementById("cpuSetupScreen")?.classList.toggle("hidden", this.gameState !== "cpuSetup");
      document.getElementById("onlineLobbyScreen")?.classList.toggle("hidden", this.gameState !== "onlineLobby");
      document.getElementById("selectScreen").classList.toggle("hidden", this.gameState !== "characterSelect");
      document.getElementById("stageScreen").classList.toggle("hidden", this.gameState !== "stageSelect");
      document.getElementById("battleControlsHint")?.classList.toggle("hidden", !isPlaying);
      document.getElementById("touchControls")?.classList.toggle("hidden", !isPlaying);
      document.getElementById("hud").classList.toggle("hidden", !isPlaying);
      document.getElementById("resultScreen").classList.toggle("hidden", this.gameState !== "gameover");
      if (!isPlaying) this.clearTouchInput();
    }

    loop(time) {
      const dt = clamp((time - this.lastTime) / 1000, 0, 0.033);
      this.lastTime = time;
      this.pollGamepads();
      this.update(dt);
      this.render();
      this.pressedKeys.clear();
      this.clearTouchPressed();
      requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    update(dt) {
      this.frameCounter += 1;
      this.fpsTimer += dt;
      this.screenShake = Math.max(0, this.screenShake - dt * 18);
      if (this.fpsTimer >= 0.5) {
        this.fps = Math.round(this.frameCounter / this.fpsTimer);
        this.frameCounter = 0;
        this.fpsTimer = 0;
      }

      if (this.freezeFrameTimer > 0 && this.gameState === "playing") {
        this.freezeFrameTimer = Math.max(0, this.freezeFrameTimer - dt);
        for (const player of this.players) {
          player.updateTimers(dt, this);
          player.animationTime += dt * 0.18;
        }
        for (const particle of this.particles) particle.update(dt * 0.35);
        this.particles = this.particles.filter((particle) => particle.life > 0);
        this.updateHUD();
        return;
      }

      for (const platform of this.platforms) platform.update(dt);
      this.platforms = this.platforms.filter((platform) => !platform.temporary || platform.lifetime > 0);

      if (this.gameState === "characterSelect") {
        this.characterSelect.handleGamepadInput(this.getMenuGamepadInput());
      }

      if (this.gameState === "playing") {
        for (const controller of this.controllers) controller?.update(dt);
        if (this.gameMode === "online") this.sendOnlineInput(dt);
        if (this.gameMode === "online") this.sendOnlinePlayerState(dt);
        if (this.gameMode === "online" && !this.onlineIsHost) {
          for (const player of this.players) {
            player.updateTimers(dt);
            player.animationTime += dt;
            player.updateVisualState(this.getPlayerInput(player.id));
          }
          this.updateHUD();
        } else {
        this.stageManager.update(dt, this);
        for (const player of this.players) player.update(dt, this);
        for (let i = 0; i < this.players.length; i += 1) {
          for (let j = i + 1; j < this.players.length; j += 1) {
            resolvePlayerCollision(this.players[i], this.players[j]);
          }
        }
        for (const hitbox of this.hitboxes) hitbox.update(dt, this);
        for (const projectile of this.projectiles) projectile.update(dt, this);
        for (const effect of this.skillEffects) effect.update(dt, this);
        this.updateItems(dt);
        this.hitboxes = this.hitboxes.filter((hitbox) => !hitbox.expired);
        this.projectiles = this.projectiles.filter((projectile) => !projectile.expired);
        this.skillEffects = this.skillEffects.filter((effect) => !effect.expired);
        this.items = this.items.filter((item) => !item.collected && item.life > 0);
        this.checkWinCondition();
        this.updateHUD();
        if (this.gameMode === "online" && this.onlineIsHost) this.sendOnlineSnapshot(dt);
        }
      }

      for (const effect of this.attackEffects) effect.update(dt);
      this.attackEffects = this.attackEffects.filter((effect) => !effect.expired);
      for (const particle of this.particles) particle.update(dt);
      this.particles = this.particles.filter((particle) => particle.life > 0);
    }

    updateItems(dt) {
      this.itemSpawnTimer -= dt;
      if (this.itemSpawnTimer <= 0 && this.items.length < 3) {
        this.spawnBattleItem();
        this.itemSpawnTimer = 7.5 + Math.random() * 6;
      }
      for (const item of this.items) item.update(dt, this);
    }

    spawnBattleItem() {
      const main = this.stageManager.activeStage?.platforms?.find((platform) => platform.type === "main") ?? { x: 180, y: 420, width: 600 };
      const roll = Math.random();
      const type = roll < 0.42 ? "coffee" : roll < 0.74 ? "first_aid" : "overtime_bomb";
      const x = clamp(main.x + 40 + Math.random() * Math.max(40, main.width - 80), 40, W - 68);
      const y = Math.max(80, main.y - 150 - Math.random() * 70);
      this.items.push(new BattleItem(type, x, y));
      this.spawnText("ITEM", x + 14, y - 10, "#ffd23f", 0.55, 15);
    }

    render() {
      const shakeX = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;
      const shakeY = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;
      ctx.save();
      ctx.translate(shakeX, shakeY);
      this.stageManager.drawBackground(ctx);
      this.drawStage();

      this.stageManager.drawHazards(ctx);
      for (const player of this.players) player.draw(ctx, this.debug);
      for (const item of this.items) item.draw(ctx);
      for (const projectile of this.projectiles) projectile.draw(ctx);
      for (const effect of this.skillEffects) effect.draw(ctx);
      for (const effect of this.attackEffects) effect.draw(ctx);
      for (const hitbox of this.hitboxes) hitbox.draw(ctx, this.debug);
      for (const particle of this.particles) particle.draw(ctx);
      if (this.gameState === "playing") this.stageManager.drawStageInfo(ctx);

      if (this.debug) this.drawDebug();
      ctx.restore();
      if (this.gameState === "playing") HUDRenderer.drawBattleHUD(ctx, this.players, this);
    }

    drawStage() {
      for (const platform of this.platforms) platform.draw(ctx);
    }

    drawDebug() {
      ctx.save();
      ctx.strokeStyle = "rgba(213, 56, 47, 0.42)";
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(BLAST_ZONE.left, BLAST_ZONE.top, BLAST_ZONE.right - BLAST_ZONE.left, BLAST_ZONE.bottom - BLAST_ZONE.top);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      roundRect(ctx, 12, H - 112, 254, 92, 8);
      ctx.fill();
      ctx.fillStyle = "#18212f";
      ctx.font = "12px monospace";
      ctx.fillText(`FPS: ${this.fps}`, 24, H - 88);
      ctx.fillText(`Hitboxes: ${this.hitboxes.length} / Projectiles: ${this.projectiles.length}`, 24, H - 70);
      const recentAttacker = this.players.find((player) => player.lastAttackDebugTimer > 0) ?? this.players[0];
      ctx.fillText(`Current Attack: ${recentAttacker?.lastAttackType || "-"}`, 24, H - 52);
      ctx.fillText(`Direction: ${recentAttacker?.lastAttackDirection || "-"}`, 24, H - 34);
      ctx.restore();
    }

    updateHUD() {
      const hud = document.getElementById("hud");
      hud.replaceChildren();
      for (const player of this.players) {
        const item = document.createElement("article");
        item.className = "hud-item";
        item.style.setProperty("--hud-color", player.color);

        const title = document.createElement("div");
        title.className = "hud-title";
        const name = document.createElement("span");
        name.textContent = `P${player.playerNumber} ${player.name}`;
        const controller = player.controllerType === "cpu" ? "CPU" : player.controllerType === "online" ? "ONLINE" : "LOCAL";
        const source = document.createElement("span");
        source.textContent = controller;
        title.append(name, source);

        const meta = document.createElement("div");
        meta.className = "hud-meta";
        const skill = player.skillCooldownTimer <= 0 ? "OK" : `${player.skillCooldownTimer.toFixed(1)}s`;
        const ultimate = player.isUsingUltimate ? "NOW" : player.ultimateCooldownTimer <= 0 ? "OK" : `${Math.ceil(player.ultimateCooldownTimer)}s`;
        const guard = player.guardBreakTimer > 0 ? "BREAK" : `${Math.round(player.guardMeter)}%`;
        const status = player.eliminated ? "脱落" : player.guardBreakTimer > 0 ? "ガードブレイク" : player.grabbedBy ? "拘束中" : player.grabbedTarget ? "つかみ中" : player.ledgeHangTimer > 0 ? "崖つかまり" : player.isChargingSmash ? "スマッシュため" : player.dodgeTimer > 0 ? "緊急回避" : player.isGuarding ? "ガード中" : player.isUsingUltimate ? "必殺技中" : player.happyStallTimer > 0 ? "硬直中" : player.happyBuffTimer > 0 ? "HAPPY中" : "参戦中";
        meta.textContent = `${player.job} / Stocks: ${player.stocks} / Skill: ${skill} / ULT: ${ultimate} / Guard: ${guard} / ${status}`;
        item.append(title, meta);
        hud.append(item);
      }
    }

    handleKO(player) {
      if (player.eliminated) return;
      if (player.grabbedTarget) player.releaseGrabbedTarget(false);
      if (player.grabbedBy) player.grabbedBy.releaseGrabbedTarget(false);
      player.stocks -= 1;
      this.spawnText("撃墜！", clamp(player.x, 80, W - 80), clamp(player.y, 60, H - 60), "#d5382f", 1.1, 28);
      this.emitOnlineCombatAction("ko", {
        targetId: player.id,
        stocks: player.stocks,
        x: Number(player.x.toFixed(1)),
        y: Number(player.y.toFixed(1))
      });

      if (player.stocks <= 0) {
        player.eliminated = true;
        player.setSpeech("脱落", 1);
        return;
      }

      const respawns = this.stageManager.activeStage.respawnPoints;
      const point = respawns[player.id] ?? respawns[0];
      player.x = point.x;
      player.y = point.y;
      player.prevX = player.x;
      player.prevY = player.y;
      player.vx = 0;
      player.vy = 0;
      player.damage = 0;
      player.invincibleTimer = 1;
      player.hitStun = 0;
      player.hitStopTimer = 0;
      player.happyBuffTimer = 0;
      player.happyStallTimer = 0;
      player.happySpeedMultiplier = 1;
      player.happyAttackMultiplier = 1;
      player.happyKnockbackMultiplier = 1;
      player.stageSpeedBoostTimer = 0;
      player.stageSpeedBoostMultiplier = 1;
      player.guardMeter = 100;
      player.isGuarding = false;
      player.guardJustTimer = 0;
      player.guardBreakTimer = 0;
      player.dodgeTimer = 0;
      player.dodgeCooldownTimer = 0;
      player.dodgeEndlagTimer = 0;
      player.grabCooldownTimer = 0;
      player.grabTimer = 0;
      player.grabbedTarget = null;
      player.grabbedBy = null;
      player.grabbedTimer = 0;
      player.ledgeHangTimer = 0;
      player.ledgeCooldownTimer = 0;
      player.ledgeSide = "";
      player.ledgePlatform = null;
      player.cancelSmashCharge();
      player.isUsingUltimate = false;
      player.ultimatePhase = "";
      player.ultimateTimer = 0;
      player.airJumpsRemaining = player.maxAirJumps;
      player.hasUsedRecovery = false;
      player.setSpeech("復活！", 0.7);
    }

    checkWinCondition() {
      if (this.players.length === 0) return;
      const alive = this.players.filter((player) => !player.eliminated);
      if (this.players.length === 1) {
        if (alive.length === 0) this.finishMatch(null);
        return;
      }
      if (alive.length <= 1) {
        this.finishMatch(alive[0] ?? null);
      }
    }

    finishMatch(winner) {
      if (this.gameState !== "playing") return;
      this.winner = winner;
      this.gameState = "gameover";
      const winnerText = document.getElementById("winnerText");
      const winnerSubText = document.getElementById("winnerSubText");
      if (winner) {
        winnerText.textContent = `P${winner.playerNumber} 勝利！`;
        winnerSubText.textContent = `${winner.name} / ${winner.job} が最後まで残りました。`;
      } else {
        winnerText.textContent = "練習終了";
        winnerSubText.textContent = "全員がステージ外に出ました。Rでやり直せます。";
      }
      this.updateScreens();
    }

    spawnCharacterAttackEffect(player, attackType, config = {}) {
      if (!player?.selectedCharacter) return;
      const character = player.selectedCharacter;
      const themeKey = effectThemeKeyForAttack(attackType);
      const theme = character.effectTheme?.[themeKey] ?? `${inferEffectFamily(character)}_${themeKey}_${character.id}`;
      const type = effectTypeForTheme(theme, attackType);
      const color = attackType === "ultimate" && config.color?.startsWith?.("#")
        ? config.color
        : effectColorForTheme(theme, character, attackType);
      const direction = player.facing || 1;
      const attackDirection = config.attackDirection ?? themeKey;
      const isUp = themeKey === "up";
      const isDown = themeKey === "down";
      const isForwardUp = attackDirection === "forwardUp";
      const isForwardDown = attackDirection === "forwardDown";
      const isAir = themeKey === "air";
      const isRecovery = themeKey === "recovery";
      const isUltimate = themeKey === "ultimate";
      const reach = Math.min(Math.max(config.width ?? 64, 48), isUltimate ? 160 : 96);
      const x = isUltimate ? player.centerX : isForwardUp || isForwardDown ? player.centerX + direction * (reach * 0.46) : isUp ? player.centerX : player.centerX + direction * (reach * 0.48);
      const y = isUltimate ? player.centerY - 10 : isForwardUp ? player.y + 4 : isForwardDown ? player.y + player.height - 2 : isUp ? player.y - 16 : isDown ? player.y + player.height - 6 : isRecovery ? player.y - 18 : player.centerY + (isAir ? -8 : 0);
      const scale = isUltimate ? 1.15 : attackType.includes("Strong") || attackType === "strongAttack" ? 1.05 : 0.78;
      const rotation = isForwardUp ? -0.55 : isForwardDown ? 0.35 : isUp ? -Math.PI / 2 : isDown ? Math.PI / 10 : isAir ? -0.45 * direction : 0;
      const duration = isUltimate ? Math.max(0.72, config.duration ?? 0.9) : isRecovery ? 0.58 : attackType.includes("Strong") || attackType === "strongAttack" ? 0.42 : 0.3;
      const text = config.effectText ?? effectTextForTheme(theme, character, attackType);

      this.attackEffects.push(new AttackEffect({
        x,
        y,
        vx: isAir ? direction * 0.5 : 0,
        vy: isRecovery ? -1.1 : 0,
        type,
        ownerId: player.id,
        duration,
        scale,
        rotation,
        color,
        data: {
          direction,
          theme,
          text: isUltimate ? text : "",
          radius: isUltimate ? 126 : undefined,
          sheets: /paper|lesson|diary|document|card|ticket|receipt|book/.test(theme) ? (attackType.includes("Strong") ? 3 : 2) : 1,
          check: /check|lesson|red_pen/.test(theme),
          markColor: /red_pen|diary|stamp/.test(theme) ? "#e63946" : undefined
        }
      }));

      if (text && !isUltimate && (attackType.includes("Strong") || attackType === "strongAttack" || character.id === "happy_repeat_student")) {
        this.spawnText(text, x, y - 20, colorToText(color), 0.55, 17);
      }
    }

    spawnCharacterHitEffect(attacker, target, label = "") {
      const character = attacker.selectedCharacter;
      const theme = character.effectTheme?.strong ?? character.effectTheme?.normal ?? `${inferEffectFamily(character)}_hit`;
      const baseType = effectTypeForTheme(theme, "strongAttack");
      const type = baseType === "paper" ? "paper" : baseType === "water" ? "water" : baseType === "dust" ? "dust" : baseType === "spark" ? "spark" : "impact";
      const color = effectColorForTheme(theme, character, "strongAttack");
      const direction = Math.sign(target.centerX - attacker.centerX) || attacker.facing || 1;
      this.attackEffects.push(new AttackEffect({
        x: target.centerX,
        y: target.centerY,
        vx: direction * 0.3,
        vy: -0.2,
        type,
        ownerId: attacker.id,
        duration: 0.28,
        scale: 0.78,
        rotation: direction * -0.12,
        color,
        data: {
          direction,
          theme,
          sheets: type === "paper" ? 2 : 1,
          check: /lesson|diary|stamp|red_pen/.test(theme)
        }
      }));
      if (label && target.damage >= 100) this.spawnText(label, target.centerX, target.y - 20, colorToText(color), 0.55, 16);
    }

    addProjectile(owner, offsetX, offsetY, width, height, vx, vy, duration, damage, baseKnockback, label, color, affliction = "", angle = null, kind = "paper", damageScale = ATTACK_DATA.projectileAttack.damageScale) {
      this.projectiles.push(new Projectile({
        owner,
        x: owner.facing > 0 ? owner.x + owner.width + offsetX : owner.x - width - offsetX,
        y: owner.y + offsetY,
        width,
        height,
        vx,
        vy,
        duration,
        damage: damage * owner.getAttackMultiplier(),
        baseKnockback: baseKnockback * owner.getKnockbackMultiplier(),
        damageScale,
        label,
        color,
        affliction,
        angle,
        kind
      }));
      owner.setSpeech(label, 0.75);
    }

    addZone(owner, effect, x, y, width, height, duration, label, color, damage = 0, baseKnockback = 0) {
      this.skillEffects.push(new SkillEffect({
        type: "zone",
        effect,
        owner,
        x,
        y,
        width,
        height,
        duration,
        damage: damage * owner.getAttackMultiplier(),
        baseKnockback: baseKnockback * owner.getKnockbackMultiplier(),
        label,
        color,
        shape: effect === "slow" ? "circle" : "rect",
        pulseRate: 0.24
      }));
      owner.setSpeech(label, 0.8);
      this.spawnText(label, owner.centerX, owner.y - 24, colorToText(color), 0.75, 19);
    }

    spawnHitParticles(x, y, color, damage = 0) {
      const count = damage >= 100 ? 16 : damage >= 70 ? 12 : 8;
      const sizeBoost = damage >= 100 ? 3 : damage >= 70 ? 1.8 : 0;
      for (let i = 0; i < count; i += 1) {
        this.particles.push(new Particle(x, y, {
          color: i % 3 === 0 && damage >= 70 ? "#ffffff" : color,
          size: 2 + sizeBoost + Math.random() * (4 + sizeBoost),
          vx: (Math.random() - 0.5) * (damage >= 100 ? 8 : 5),
          vy: (Math.random() - 0.75) * (damage >= 100 ? 8 : 5),
          life: 0.35 + Math.random() * (damage >= 100 ? 0.34 : 0.25)
        }));
      }
    }

    spawnGuardParticles(x, y, color = "#7ed3ff") {
      for (let i = 0; i < 8; i += 1) {
        const angle = i * Math.PI * 2 / 8;
        this.particles.push(new Particle(x + Math.cos(angle) * 18, y + Math.sin(angle) * 24, {
          color: i % 2 === 0 ? "rgba(126,211,255,0.9)" : color,
          size: 2.5 + Math.random() * 2,
          vx: Math.cos(angle) * 1.2,
          vy: Math.sin(angle) * 1.2,
          life: 0.22 + Math.random() * 0.14
        }));
      }
    }

    spawnDodgeEffect(player) {
      const direction = player.dodgeDirection === "left" ? -1 : player.dodgeDirection === "right" ? 1 : player.facing || 1;
      this.spawnText("緊急回避！", player.centerX, player.y - 18, "#7ed3ff", 0.42, 16);
      for (let i = 0; i < 10; i += 1) {
        this.particles.push(new Particle(player.centerX - direction * i * 5, player.centerY + (Math.random() - 0.5) * 28, {
          color: i % 2 === 0 ? "rgba(255,255,255,0.86)" : "rgba(126,211,255,0.78)",
          lineAngle: direction > 0 ? Math.PI * 0.1 : Math.PI * 0.9,
          lineLength: 16 + Math.random() * 20,
          lineWidth: 2,
          vx: -direction * (1.2 + Math.random() * 2),
          vy: (Math.random() - 0.5) * 1.8,
          life: 0.25 + Math.random() * 0.16
        }));
      }
    }

    spawnKnockbackLines(x, y, direction = 1) {
      for (let i = 0; i < 12; i += 1) {
        const angle = (direction >= 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.8;
        this.particles.push(new Particle(x + (Math.random() - 0.5) * 36, y + (Math.random() - 0.5) * 44, {
          color: i % 2 === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,51,51,0.85)",
          lineAngle: angle,
          lineLength: 36 + Math.random() * 42,
          lineWidth: 2 + Math.random() * 2.4,
          vx: direction * (2.5 + Math.random() * 3),
          vy: (Math.random() - 0.5) * 3,
          life: 0.34 + Math.random() * 0.18
        }));
      }
    }

    spawnText(text, x, y, color, life = 0.8, fontSize = 20) {
      this.particles.push(new Particle(x, y, {
        text,
        color,
        life,
        fontSize,
        vx: 0,
        vy: -1.2
      }));
    }

    getPlayerInput(playerIndex) {
      return normalizeInput(this.controllers[playerIndex]?.currentInput);
    }

    getTouchInput() {
      const held = this.touchHeld;
      const pressed = this.touchPressed;
      const moveX = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
      return normalizeInput({
        moveX,
        up: held.has("up"),
        down: held.has("down"),
        jumpPressed: pressed.has("jump"),
        normalPressed: pressed.has("normal"),
        strongPressed: pressed.has("strong"),
        strongHeld: held.has("strong"),
        grabPressed: pressed.has("grab"),
        skillPressed: pressed.has("skill"),
        ultimatePressed: pressed.has("ultimate"),
        guardHeld: held.has("guard"),
        dodgePressed: pressed.has("dodge")
      });
    }

    clearTouchPressed() {
      this.touchPressed.clear();
    }

    clearTouchInput() {
      this.touchHeld.clear();
      this.touchPressed.clear();
      this.touchPointers.clear();
      document.querySelectorAll("#touchControls .is-active").forEach((button) => button.classList.remove("is-active"));
    }

    pollGamepads() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      this.gamepadPressed.clear();
      for (let i = 0; i < 4; i += 1) {
        const pad = pads[i];
        const previous = this.gamepadPrevious.get(i) ?? [];
        const now = pad ? pad.buttons.map((button) => button.pressed) : [];
        const pressed = [];
        now.forEach((isPressed, buttonIndex) => {
          pressed[buttonIndex] = isPressed && !previous[buttonIndex];
        });
        this.gamepadPressed.set(i, pressed);
        this.gamepadPrevious.set(i, now);
      }
    }

    getMenuGamepadInput() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = pads[0];
      if (!pad) return null;
      const pressed = this.gamepadPressed.get(0) ?? [];
      const axisX = pad.axes[0] ?? 0;
      const axisLeft = axisX < -0.6;
      const axisRight = axisX > 0.6;
      const leftPressed = Boolean(pressed[14]) || (axisLeft && !this.menuAxisHeld.left);
      const rightPressed = Boolean(pressed[15]) || (axisRight && !this.menuAxisHeld.right);
      this.menuAxisHeld.left = axisLeft;
      this.menuAxisHeld.right = axisRight;
      return {
        leftPressed,
        rightPressed,
        pageLeftPressed: Boolean(pressed[4]),
        pageRightPressed: Boolean(pressed[5]),
        confirmPressed: Boolean(pressed[0]),
        backPressed: Boolean(pressed[1])
      };
    }

    getGamepadInput(playerIndex) {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = pads[playerIndex];
      if (!pad) {
        return { moveX: 0, up: false, down: false, jumpPressed: false, normalPressed: false, strongPressed: false, strongHeld: false, grabPressed: false, skillPressed: false, ultimatePressed: false, guardHeld: false, dodgePressed: false };
      }
      const axisX = pad.axes[0] ?? 0;
      const axisY = pad.axes[1] ?? 0;
      const moveX = Math.abs(axisX) > 0.25 ? Math.sign(axisX) : 0;
      const pressed = this.gamepadPressed.get(playerIndex) ?? [];
      return {
        moveX,
        up: axisY < -0.35 || Boolean(pad.buttons[12]?.pressed),
        down: axisY > 0.35 || Boolean(pad.buttons[13]?.pressed),
        jumpPressed: Boolean(pressed[0]),
        normalPressed: Boolean(pressed[2]),
        strongPressed: Boolean(pressed[1]),
        strongHeld: Boolean(pad.buttons[1]?.pressed),
        grabPressed: Boolean(pressed[8]),
        skillPressed: Boolean(pressed[3]),
        ultimatePressed: Boolean(pressed[7]),
        guardHeld: Boolean(pad.buttons[4]?.pressed) || Boolean(pad.buttons[6]?.pressed),
        dodgePressed: Boolean(pressed[5])
      };
    }
  }

  function getSkillCooldown(id) {
    if (id === "happy_repeat_student") return 9;
    if (id === "doctor" || id === "nurse" || id === "hairdresser") return 7;
    if (id === "construction" || id === "farmer" || id === "cleaner") return 8.5;
    if (id === "streamer" || id === "barista" || id === "security") return 8;
    return 6.5;
  }

  function isGameKey(code) {
    return code === "Space" ||
      code === "Enter" ||
      code === "Escape" ||
      code === "F1" ||
      code === "KeyR" ||
      code === "KeyQ" ||
      code === "KeyE" ||
      code.startsWith("Arrow") ||
      Object.values(localControls).includes(code) ||
      /Digit[1-4]/.test(code);
  }

  function drawBackground(ctx) {
    const sky = ctx.createLinearGradient(0, 0, W, H);
    sky.addColorStop(0, "#9ee7ff");
    sky.addColorStop(0.35, "#f9f6a7");
    sky.addColorStop(0.72, "#ffb7a8");
    sky.addColorStop(1, "#b7f3c2");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 7; i += 1) {
      const x = 70 + i * 145;
      const y = 80 + Math.sin(i) * 18;
      roundRect(ctx, x, y, 86, 24, 12);
      ctx.fill();
      roundRect(ctx, x + 28, y - 13, 70, 22, 12);
      ctx.fill();
    }
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#18212f";
    for (let i = 0; i < 9; i += 1) {
      const x = i * 116;
      const h = 40 + (i % 3) * 18;
      roundRect(ctx, x, H - h, 86, h, 4);
      ctx.fill();
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function shadeStageColor(hex, amount) {
    const value = hex.replace("#", "");
    const number = Number.parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
    const r = clamp((number >> 16) + amount, 0, 255);
    const g = clamp(((number >> 8) & 255) + amount, 0, 255);
    const b = clamp((number & 255) + amount, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function colorToText(color) {
    if (color.includes("255, 210")) return "#a56b00";
    if (color.includes("228")) return "#d5382f";
    if (color.includes("68")) return "#0f77bb";
    return "#0d7c72";
  }

  function getDamageColor(damage) {
    if (damage >= 150) return "#ff3333";
    if (damage >= 100) return "#ff9933";
    if (damage >= 50) return "#ffdd44";
    return "#ffffff";
  }

  window.JobBrawlersDebug = {
    get characters() {
      return characters;
    },
    get stages() {
      return stages;
    },
    rectsOverlap,
    resolvePlatformCollision,
    resolvePlayerCollision,
    applyKnockback
  };

  const game = new Game();
  window.JobBrawlersDebug.game = game;
})();
