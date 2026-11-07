const EXTRA_DISHES = [
  {
    "id": "staple-20261020-01",
    "name": "白米饭",
    "category": "主食",
    "calories": 116,
    "fiber": 0.3,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-01.jpg"
  },
  {
    "id": "staple-20261020-02",
    "name": "糙米饭",
    "category": "主食",
    "calories": 123,
    "fiber": 1.6,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-02.jpg"
  },
  {
    "id": "staple-20261020-03",
    "name": "面条",
    "category": "主食",
    "calories": 110,
    "fiber": 1,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-03.jpg"
  },
  {
    "id": "staple-20261020-04",
    "name": "馒头",
    "category": "主食",
    "calories": 223,
    "fiber": 1.3,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-04.jpg"
  },
  {
    "id": "staple-20261020-06",
    "name": "水饺",
    "category": "主食",
    "calories": 180,
    "fiber": 1.2,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-06.jpg"
  },
  {
    "id": "staple-20261020-07",
    "name": "馄饨",
    "category": "主食",
    "calories": 150,
    "fiber": 0.8,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-07.jpg"
  },
  {
    "id": "staple-20261020-08",
    "name": "包子",
    "category": "主食",
    "calories": 220,
    "fiber": 1.2,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-08.jpg"
  },
  {
    "id": "staple-20261020-09",
    "name": "粉丝",
    "category": "主食",
    "calories": 100,
    "fiber": 0.4,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-09.jpg"
  },
  {
    "id": "staple-20261020-10",
    "name": "煎牛排",
    "category": "高蛋白",
    "calories": 230,
    "fiber": 0,
    "estimated": true,
    "image": "https://menu.local/photos/staple-20261020-10.jpg"
  }
];

const CATEGORY_ORDER = [
  "小炒菜",
  "高蛋白",
  "减脂菜",
  "凉菜",
  "炖汤",
  "主食"
];

const PRESET_SHOPS = [
  {
    "id": "store-20261020-01",
    "shop": "肯德基",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-01.jpg"
  },
  {
    "id": "store-20261020-02",
    "shop": "大佬王牛肉面",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-02.jpg"
  },
  {
    "id": "store-20261020-03",
    "shop": "必胜客",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-03.jpg"
  },
  {
    "id": "store-20261020-04",
    "shop": "尊宝披萨",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-04.jpg"
  },
  {
    "id": "store-20261020-05",
    "shop": "喜姐炸串",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-05.jpg"
  },
  {
    "id": "store-20261020-06",
    "shop": "麦当劳",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-06.jpg"
  },
  {
    "id": "store-20261020-07",
    "shop": "武秀才鲜炒地锅鸡",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-07.jpg"
  },
  {
    "id": "store-20261020-08",
    "shop": "俊锋太和板面",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-08.jpg"
  },
  {
    "id": "store-20261020-09",
    "shop": "麻辣香锅",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-09.jpg"
  },
  {
    "id": "store-20261020-10",
    "shop": "冒菜",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-10.jpg"
  },
  {
    "id": "store-20261020-11",
    "shop": "绝味鸭脖",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-11.jpg"
  },
  {
    "id": "store-20261020-12",
    "shop": "曹氏鸭脖",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-12.jpg"
  },
  {
    "id": "store-20261020-13",
    "shop": "椒麻鸡",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-13.jpg"
  },
  {
    "id": "store-20261020-14",
    "shop": "海底捞·下饭火锅菜",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-14.jpg"
  },
  {
    "id": "store-20261020-15",
    "shop": "塔斯汀",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-15.jpg"
  },
  {
    "id": "store-20261020-16",
    "shop": "绿茶餐厅",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-16.jpg"
  },
  {
    "id": "store-20261020-17",
    "shop": "酸辣粉",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-17.jpg"
  },
  {
    "id": "store-20261020-18",
    "shop": "袁记云饺",
    "dish": "",
    "price": null,
    "calories": null,
    "image": "https://menu.local/photos/store-20261020-18.jpg"
  }
];

const PRESET_RECIPES = {
  "青椒炒肉": "1. 猪肉切片，加少量酱油和淀粉抓匀；青椒去籽切块。\n2. 少量油炒香姜蒜，将肉炒熟盛出。\n3. 青椒炒至断生，加回肉片和少量盐，翻匀出锅。",
  "酸辣土豆丝": "1. 土豆切细丝，清水冲去表面淀粉后沥干。\n2. 少量油炒香蒜末和干辣椒，放土豆丝翻炒。\n3. 加适量醋和盐，炒至土豆丝熟透后出锅。",
  "手撕包菜": "1. 包菜洗净沥水，用手撕成小片，硬梗切薄。\n2. 少量油炒香蒜片和干辣椒。\n3. 先炒梗后炒叶，熟后加少量酱油和醋翻匀。",
  "清炒空心菜": "1. 空心菜择洗干净，菜梗和叶分开。\n2. 少量油炒香蒜末，先放菜梗翻炒。\n3. 加入菜叶炒至熟软，少量盐调味出锅。",
  "葱油手撕鸡": "1. 鸡肉放葱姜水中煮至中心熟透，取出晾温撕丝。\n2. 葱段用少量油煎香，加酱油和少许鸡汤。\n3. 葱油汁浇在鸡丝上拌匀，及时食用。",
  "韭菜鸡蛋": "1. 韭菜洗净切段，鸡蛋打散。\n2. 少量油炒鸡蛋至凝固，加入韭菜。\n3. 翻炒至韭菜熟、蛋液完全凝固，少量盐调味。",
  "鱼香肉丝": "1. 猪肉、木耳、胡萝卜和青椒切丝，肉丝腌匀。\n2. 蒜姜和少量豆瓣酱炒香，炒熟肉丝后加入配菜。\n3. 加酱油、醋、少量糖和水调成的鱼香汁，炒熟收汁。",
  "香辣鸡翅": "1. 鸡翅洗净划刀，加酱油和姜片腌匀。\n2. 少量油煎香两面，加入蒜和辣椒。\n3. 加少许水焖至中心熟透，收汁后出锅。",
  "酸汤鱼片": "1. 鱼片加少量盐和淀粉腌匀，配菜洗净。\n2. 姜蒜炒香，加入番茄或酸汤底及水，煮熟配菜。\n3. 鱼片逐片下锅，轻推散开，煮至熟透。",
  "凉拌手撕鸡": "1. 鸡肉加葱姜煮至中心完全熟透，晾温撕丝。\n2. 蒜末、醋、酱油和少许香油调成拌汁。\n3. 加入鸡丝和香菜拌匀，及时食用。",
  "白灼虾": "1. 鲜虾洗净，按需要去虾线。\n2. 葱姜水烧沸后下虾，煮至虾肉不透明且完全熟透。\n3. 捞出沥水，搭配少量蒜蓉酱油蘸食。",
  "红烧鸡翅": "1. 鸡翅洗净划刀，擦干水分。\n2. 少量油煎香两面，加入姜蒜、酱油和少量糖。\n3. 加水焖至中心熟透，收汁后撒葱。",
  "蒜蓉西兰花": "1. 西兰花掰小朵洗净，粗梗切薄。\n2. 沸水中焯熟沥干，少量油炒香蒜末。\n3. 倒入西兰花翻匀，少量盐调味。",
  "家常豆腐": "1. 豆腐切块沥水，木耳和青椒洗切。\n2. 豆腐少油煎定型，姜蒜和少量豆瓣酱炒香。\n3. 加入豆腐和配菜，少许水焖熟，轻翻调味。",
  "回锅肉": "1. 五花肉加葱姜煮熟，晾温切薄片；配菜洗切。\n2. 肉片下锅煸出部分油脂，加入少量豆瓣酱。\n3. 放青椒或蒜苗炒熟，酱油调味。",
  "青椒鸡胸肉": "1. 鸡胸肉切片，加少量酱油、淀粉和水抓匀。\n2. 少量油炒熟鸡肉，放蒜末和青椒块。\n3. 青椒炒熟后少量盐调味，避免过量加油。",
  "辣子鸡丁": "1. 鸡肉切小丁，加酱油、姜和少量淀粉腌匀。\n2. 用少量油分批煎炒至鸡肉中心熟透。\n3. 加入干辣椒、花椒和蒜片炒香，少量盐调味。",
  "红烧肉": "1. 五花肉切块，焯洗沥干。\n2. 少油炒香姜葱，加入肉块、酱油、少量糖和热水。\n3. 小火炖至熟软，按喜好开盖收汁。",
  "水煮肉片": "1. 瘦肉切片，用少量盐、淀粉和水抓匀。\n2. 姜蒜和豆瓣酱炒香，加水煮开，先把白菜或豆芽煮熟。\n3. 放肉片轻推散开，煮至熟透，少量花椒辣椒调味。",
  "麻辣口水鸡": "1. 鸡肉加葱姜煮至中心熟透，晾温切块。\n2. 酱油、醋、蒜末、花椒及少量辣椒油调匀。\n3. 淋在鸡块上，撒芝麻或花生碎，及时食用。",
  "西红柿炒鸡蛋": "1. 番茄切块，鸡蛋打散。\n2. 蛋液炒至凝固盛出，少油炒番茄至出汁。\n3. 加回鸡蛋，少量盐调味，炒至蛋完全熟透。",
  "油焖大虾": "1. 大虾洗净去虾线，擦干表面。\n2. 少量油煎香两面，加姜蒜、酱油、少量糖和水。\n3. 焖至虾肉完全熟透，开盖收汁。",
  "蒜蓉生菜": "1. 生菜择洗干净沥水，蒜切末。\n2. 少量油炒香蒜末，放生菜快速翻炒。\n3. 炒至叶片熟软，少量盐和酱油调味。",
  "菠萝咕咾肉": "1. 里脊切块腌匀薄裹淀粉，菠萝和青椒切块。\n2. 将肉煎至熟透，番茄酱、醋、少量糖和水煮成汁。\n3. 倒入肉、菠萝及青椒翻匀，待青椒熟后出锅。",
  "四季豆炒肉丝": "1. 四季豆摘筋切丝，肉丝腌匀。\n2. 肉丝先炒熟盛出，四季豆加水焖炒至完全熟透。\n3. 加回肉丝翻匀，盐和酱油调味。",
  "可乐鸡翅": "1. 鸡翅划刀洗净沥干，少量油煎香两面。\n2. 加入可乐、酱油及姜片，液体基本没过鸡翅。\n3. 焖至鸡翅中心熟透，开盖收汁，注意避免焦糖粘锅。",
  "土豆炖牛腩": "1. 牛腩切块焯洗，土豆切滚刀块。\n2. 牛腩和葱姜炒香，加酱油和热水炖软。\n3. 加入土豆炖至熟透，盐调味并适当收汁。",
  "风味茄子": "1. 茄子切条薄裹淀粉，少油煎至外香内熟。\n2. 蒜、花椒和干辣椒炒香，加酱油、醋、少量糖和水。\n3. 将茄子倒回锅中，快速翻匀裹汁。",
  "肉末豆腐": "1. 豆腐切块，猪肉剁末。\n2. 姜蒜炒香，肉末炒至熟透，加少量酱油。\n3. 放豆腐及少量水焖熟，轻推避免碎裂，撒葱。",
  "香辣鱿鱼": "1. 鱿鱼去内脏、软骨洗净切条，沥水。\n2. 姜蒜和辣椒炒香，倒入鱿鱼翻炒。\n3. 加酱油，炒至鱿鱼完全熟透，收干出锅。",
  "凉拌鸡胸肉": "1. 鸡胸肉放葱姜水中煮至中心熟透，晾温撕丝。\n2. 加蒜末、醋、酱油和少量香油拌匀。\n3. 可搭配焯熟蔬菜，及时食用。",
  "香菜拌鸭珍": "1. 按鸭胗处理：清理干净，加葱姜煮熟，晾温切薄片。\n2. 香菜洗净切段，蒜末、醋、酱油调成汁。\n3. 鸭胗与香菜拌匀，及时食用。",
  "糖醋里脊": "1. 里脊切条腌匀，薄裹淀粉煎至肉熟透。\n2. 番茄酱、醋、少量糖和水调匀煮开。\n3. 倒入里脊翻匀裹汁，撒少量芝麻。",
  "青椒酿肉": "1. 猪肉馅加葱姜、酱油及少量淀粉拌匀，青椒去籽。\n2. 将肉馅填入青椒，少油煎定型。\n3. 加入少量酱油水焖至肉馅中心完全熟透，再收汁。",
  "椒盐鸡翅": "1. 鸡翅划刀，加姜片和少量酱油腌匀。\n2. 少油中小火煎香两面，再加少量水焖至中心熟透。\n3. 收干后撒椒盐、辣椒粉，翻匀出锅。",
  "柠檬鸡翅": "1. 鸡翅划刀，加姜片、酱油和少量柠檬汁腌匀。\n2. 少量油煎香两面，加水焖至中心熟透。\n3. 加入少量柠檬片和糖调味，收汁；柠檬籽去掉避免发苦。",
  "红烧猪蹄": "1. 猪蹄清理切块，焯洗干净。\n2. 葱姜炒香，加猪蹄、酱油、少量糖和热水。\n3. 炖至熟软，按喜好收汁，注意去骨后称重。",
  "干锅花菜": "1. 花菜掰小朵洗净沥干，蒜和辣椒切好。\n2. 少量油煸香蒜、辣椒，加入花菜翻炒。\n3. 加少量水助熟，酱油调味，收干后出锅。",
  "宫保鸡丁": "1. 鸡肉切丁腌匀，黄瓜或青椒切丁，准备熟花生。\n2. 鸡丁炒至中心熟透，再放姜蒜、辣椒和配菜。\n3. 酱油、醋、少量糖及水调汁倒入，最后加入熟花生翻匀。",
  "葱油鸡": "1. 鸡肉放葱姜水中煮至中心熟透，取出切块。\n2. 葱段在少量油中煎香，加酱油和少量鸡汤。\n3. 葱油汁淋在鸡块上，及时食用。",
  "干煸豆角": "1. 豆角摘筋切段，洗净沥干。\n2. 少量油反复煸炒，加少许水焖至完全熟透。\n3. 收干水分后加蒜末、干辣椒和少量盐炒香。",
  "香辣爆炒蛏子": "1. 鲜活蛏子充分吐沙，刷洗外壳。\n2. 姜蒜和辣椒炒香，放蛏子和少量水。\n3. 焖炒至开口且肉完全熟透，酱油调味；异常或未开口贝类弃用。",
  "酸菜鱼": "1. 鱼片加盐和淀粉腌匀，酸菜洗净切段。\n2. 姜蒜炒香酸菜，加水煮开。\n3. 先煮熟鱼骨等配料，再下鱼片，煮至完全熟透。",
  "麻辣香锅": "1. 肉片、丸子和耐煮蔬菜分别煮熟沥水。\n2. 姜蒜和少量麻辣底料炒香。\n3. 放入食材翻炒入味，最后放易熟菜，确保食材均熟透。",
  "白菜卷肉": "1. 白菜叶焯软，肉馅加姜葱、酱油和少量淀粉拌匀。\n2. 用白菜叶包住肉馅码盘。\n3. 蒸至肉馅中心完全熟透，淋少量酱油汁。",
  "梅菜扣肉": "1. 梅干菜泡洗沥干，五花肉煮熟后煎香表皮切片。\n2. 肉片加酱油调味，肉皮朝下码碗，铺梅干菜。\n3. 上锅蒸至肉熟软，扣入盘中，按需收浓汤汁。",
  "牛肉炒笋": "1. 牛肉逆纹切片腌匀，笋切片焯煮后沥干。\n2. 少量油将牛肉炒至熟透盛出。\n3. 炒香姜蒜及笋片，加回牛肉，酱油调味。",
  "粉丝蒸生蚝": "1. 生蚝清理干净，粉丝泡软切短，蒜剁末。\n2. 粉丝垫在蚝肉下，铺蒜末和少量酱油。\n3. 水沸后蒸至蚝肉完全熟透，撒葱花。",
  "红烧狮子头": "1. 猪肉馅加葱姜、酱油、少量淀粉和水搅拌，团成肉丸。\n2. 少量油将肉丸煎定型。\n3. 加酱油水焖至肉丸中心完全熟透，可搭配煮熟青菜。",
  "清蒸鲈鱼": "1. 鲈鱼去鳃和内脏洗净，鱼身划刀，铺葱姜。\n2. 水沸后入锅蒸，按鱼大小调整时间，蒸至最厚处熟透。\n3. 倒掉腥水，放葱丝，淋少量蒸鱼豉油及热油。",
  "香菇滑鸡": "1. 鸡肉切块，加少量酱油、淀粉和水抓匀；香菇切片。\n2. 姜片炒香，加入鸡肉和香菇翻炒。\n3. 加少许水焖至鸡肉中心熟透，收汁撒葱。",
  "冬瓜丸子汤": "1. 冬瓜去皮切片，肉馅加葱姜和少量盐搅匀。\n2. 水煮开后转小火，下入搓好的肉丸。\n3. 肉丸煮至中心熟透后放冬瓜，煮软调盐。",
  "香干炒芹菜": "1. 香干切条，芹菜洗净切段。\n2. 少量油炒香蒜末，加入香干炒热。\n3. 放芹菜炒熟，酱油和少量盐调味。",
  "土豆烧排骨": "1. 排骨焯洗，土豆切滚刀块。\n2. 葱姜炒香，排骨加酱油及水焖至接近熟软。\n3. 加入土豆焖至熟透，调盐收汁。",
  "干煸肥肠": "1. 选清理并充分煮熟的肥肠，切小段擦干。\n2. 中小火煸出部分油脂，加入蒜、辣椒和花椒。\n3. 放青椒翻炒至熟，少量酱油调味，彻底加热。",
  "虾仁滑蛋": "1. 虾仁去虾线洗净沥干，鸡蛋加少量水和盐打散。\n2. 少量油先把虾仁炒熟盛出。\n3. 蛋液下锅轻推，加入虾仁，炒至蛋液完全凝固。",
  "苦瓜炒蛋": "1. 苦瓜去瓤切薄片，按喜好焯水沥干，鸡蛋打散。\n2. 少量油先炒熟苦瓜。\n3. 倒入蛋液翻炒至完全凝固，少量盐调味。",
  "小炒黄牛肉": "1. 牛肉逆纹切薄片腌匀，辣椒切段，香菜切好。\n2. 少量油炒香姜蒜，快速炒熟牛肉。\n3. 加入辣椒炒熟，少量酱油调味，最后放香菜。",
  "笋干烧肉": "1. 笋干充分泡软洗净切段，猪肉切块焯洗。\n2. 姜葱炒香肉块，加酱油和热水焖煮。\n3. 加入笋干炖至肉熟软、笋干入味，按需收汁。",
  "木耳炒肉片": "1. 木耳泡发洗净，猪肉切片腌匀。\n2. 少量油炒熟肉片，加入姜蒜和木耳。\n3. 少量水焖炒至木耳熟透，酱油和盐调味。",
  "清蒸排骨": "1. 排骨切小块洗净沥干，用姜末、酱油和少量淀粉腌匀。\n2. 平铺浅盘，水沸后上锅蒸。\n3. 按块大小蒸至中心熟透、肉质软嫩，撒葱。",
  "白米饭": "1. 大米淘洗后按电饭煲刻度加水。\n2. 选择煮饭程序煮熟，结束后焖数分钟。\n3. 翻松米饭，称取熟饭食用重量。",
  "糙米饭": "1. 糙米洗净，按需要提前浸泡。\n2. 按电饭煲糙米程序和刻度加水煮熟。\n3. 焖至米粒柔软后翻松。",
  "面条": "1. 水烧开后下干面或鲜面，轻搅防粘。\n2. 煮至面条熟透无硬芯。\n3. 捞出配清汤或少量调味，热量按不含额外浇头的熟面估算。",
  "馒头": "1. 面粉、酵母和温水揉成面团，发酵后排气整形。\n2. 二次醒发后入蒸锅。\n3. 蒸至内部熟透，关火稍焖再开盖。",
  "水饺": "1. 准备饺子皮和猪肉蔬菜馅，包好捏紧边缘。\n2. 水沸后下锅轻搅，按大小煮至馅料中心完全熟透。\n3. 捞出沥水；估算不含蘸汁。",
  "馄饨": "1. 猪肉蔬菜馅包入馄饨皮，收紧封口。\n2. 沸水中煮至皮和馅均完全熟透。\n3. 配清汤食用；营养按熟馄饨本体、不含额外油汤估算。",
  "包子": "1. 酵母面团发酵排气，包入猪肉蔬菜馅。\n2. 醒发后上锅蒸至馅料完全熟透。\n3. 关火稍焖开盖，营养按熟包子可食部分估算。",
  "粉丝": "1. 干粉丝按包装要求泡软。\n2. 放入沸水或清汤煮熟后沥水。\n3. 配少量调味，营养按泡发煮熟、不加肉油的粉丝估算。",
  "煎牛排": "1. 牛排充分解冻后擦干表面，撒少量盐和黑胡椒。\n2. 锅热后加入少量油，放牛排两面煎香，按厚度调小火继续加热。\n3. 煎至适合的熟度后静置再切；绞肉或拼接牛排应完全熟透。估算不含额外黄油和酱汁。"
};

const PRESET_DISHES = [
  {
    "id": "preset-20261020-001",
    "name": "青椒炒肉",
    "category": "小炒菜",
    "calories": 180,
    "fiber": 1.1,
    "estimated": true
  },
  {
    "id": "preset-20261020-002",
    "name": "酸辣土豆丝",
    "category": "小炒菜",
    "calories": 110,
    "fiber": 1.5,
    "estimated": true
  },
  {
    "id": "preset-20261020-004",
    "name": "手撕包菜",
    "category": "减脂菜",
    "calories": 65,
    "fiber": 1.6,
    "estimated": true
  },
  {
    "id": "preset-20261020-005",
    "name": "清炒空心菜",
    "category": "减脂菜",
    "calories": 55,
    "fiber": 2,
    "estimated": true
  },
  {
    "id": "preset-20261020-007",
    "name": "葱油手撕鸡",
    "category": "高蛋白",
    "calories": 205,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-008",
    "name": "韭菜鸡蛋",
    "category": "小炒菜",
    "calories": 145,
    "fiber": 1,
    "estimated": true
  },
  {
    "id": "preset-20261020-009",
    "name": "鱼香肉丝",
    "category": "小炒菜",
    "calories": 190,
    "fiber": 1.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-010",
    "name": "香辣鸡翅",
    "category": "小炒菜",
    "calories": 265,
    "fiber": 0.3,
    "estimated": true
  },
  {
    "id": "preset-20261020-012",
    "name": "酸汤鱼片",
    "category": "高蛋白",
    "calories": 105,
    "fiber": 0.4,
    "estimated": true
  },
  {
    "id": "preset-20261020-014",
    "name": "凉拌手撕鸡",
    "category": "凉菜",
    "calories": 175,
    "fiber": 0.4,
    "estimated": true
  },
  {
    "id": "preset-20261020-015",
    "name": "白灼虾",
    "category": "高蛋白",
    "calories": 95,
    "fiber": 0,
    "estimated": true
  },
  {
    "id": "preset-20261020-016",
    "name": "红烧鸡翅",
    "category": "小炒菜",
    "calories": 245,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-018",
    "name": "蒜蓉西兰花",
    "category": "减脂菜",
    "calories": 60,
    "fiber": 2.6,
    "estimated": true
  },
  {
    "id": "preset-20261020-023",
    "name": "家常豆腐",
    "category": "小炒菜",
    "calories": 155,
    "fiber": 1,
    "estimated": true
  },
  {
    "id": "preset-20261020-025",
    "name": "回锅肉",
    "category": "小炒菜",
    "calories": 340,
    "fiber": 0.8,
    "estimated": true
  },
  {
    "id": "preset-20261020-027",
    "name": "青椒鸡胸肉",
    "category": "高蛋白",
    "calories": 130,
    "fiber": 0.8,
    "estimated": true
  },
  {
    "id": "preset-20261020-028",
    "name": "辣子鸡丁",
    "category": "小炒菜",
    "calories": 285,
    "fiber": 0.7,
    "estimated": true
  },
  {
    "id": "preset-20261020-029",
    "name": "红烧肉",
    "category": "小炒菜",
    "calories": 450,
    "fiber": 0.1,
    "estimated": true
  },
  {
    "id": "preset-20261020-030",
    "name": "水煮肉片",
    "category": "小炒菜",
    "calories": 180,
    "fiber": 0.8,
    "estimated": true
  },
  {
    "id": "preset-20261020-031",
    "name": "麻辣口水鸡",
    "category": "凉菜",
    "calories": 230,
    "fiber": 0.5,
    "estimated": true
  },
  {
    "id": "preset-20261020-032",
    "name": "西红柿炒鸡蛋",
    "category": "小炒菜",
    "calories": 115,
    "fiber": 0.6,
    "estimated": true
  },
  {
    "id": "preset-20261020-033",
    "name": "油焖大虾",
    "category": "高蛋白",
    "calories": 165,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-035",
    "name": "蒜蓉生菜",
    "category": "减脂菜",
    "calories": 45,
    "fiber": 1.1,
    "estimated": true
  },
  {
    "id": "preset-20261020-037",
    "name": "菠萝咕咾肉",
    "category": "小炒菜",
    "calories": 260,
    "fiber": 0.7,
    "estimated": true
  },
  {
    "id": "preset-20261020-039",
    "name": "四季豆炒肉丝",
    "category": "小炒菜",
    "calories": 155,
    "fiber": 1.7,
    "estimated": true
  },
  {
    "id": "preset-20261020-040",
    "name": "可乐鸡翅",
    "category": "小炒菜",
    "calories": 250,
    "fiber": 0,
    "estimated": true
  },
  {
    "id": "preset-20261020-041",
    "name": "土豆炖牛腩",
    "category": "小炒菜",
    "calories": 155,
    "fiber": 0.8,
    "estimated": true
  },
  {
    "id": "preset-20261020-042",
    "name": "风味茄子",
    "category": "小炒菜",
    "calories": 220,
    "fiber": 1.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-043",
    "name": "肉末豆腐",
    "category": "小炒菜",
    "calories": 140,
    "fiber": 0.4,
    "estimated": true
  },
  {
    "id": "preset-20261020-044",
    "name": "香辣鱿鱼",
    "category": "高蛋白",
    "calories": 140,
    "fiber": 0.4,
    "estimated": true
  },
  {
    "id": "preset-20261020-048",
    "name": "凉拌鸡胸肉",
    "category": "凉菜",
    "calories": 135,
    "fiber": 0.5,
    "estimated": true
  },
  {
    "id": "preset-20261020-049",
    "name": "香菜拌鸭珍",
    "category": "凉菜",
    "calories": 125,
    "fiber": 0.5,
    "estimated": true
  },
  {
    "id": "preset-20261020-051",
    "name": "糖醋里脊",
    "category": "小炒菜",
    "calories": 290,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-052",
    "name": "青椒酿肉",
    "category": "小炒菜",
    "calories": 190,
    "fiber": 0.9,
    "estimated": true
  },
  {
    "id": "preset-20261020-054",
    "name": "椒盐鸡翅",
    "category": "小炒菜",
    "calories": 295,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-058",
    "name": "柠檬鸡翅",
    "category": "小炒菜",
    "calories": 245,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-059",
    "name": "红烧猪蹄",
    "category": "小炒菜",
    "calories": 285,
    "fiber": 0.1,
    "estimated": true
  },
  {
    "id": "preset-20261020-063",
    "name": "干锅花菜",
    "category": "小炒菜",
    "calories": 125,
    "fiber": 1.7,
    "estimated": true
  },
  {
    "id": "preset-20261020-064",
    "name": "宫保鸡丁",
    "category": "小炒菜",
    "calories": 220,
    "fiber": 1.3,
    "estimated": true
  },
  {
    "id": "preset-20261020-065",
    "name": "葱油鸡",
    "category": "高蛋白",
    "calories": 215,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-066",
    "name": "干煸豆角",
    "category": "小炒菜",
    "calories": 170,
    "fiber": 2.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-067",
    "name": "香辣爆炒蛏子",
    "category": "高蛋白",
    "calories": 110,
    "fiber": 0.4,
    "estimated": true
  },
  {
    "id": "preset-20261020-070",
    "name": "酸菜鱼",
    "category": "高蛋白",
    "calories": 140,
    "fiber": 0.7,
    "estimated": true
  },
  {
    "id": "preset-20261020-071",
    "name": "麻辣香锅",
    "category": "小炒菜",
    "calories": 230,
    "fiber": 1.5,
    "estimated": true
  },
  {
    "id": "preset-20261020-072",
    "name": "白菜卷肉",
    "category": "减脂菜",
    "calories": 100,
    "fiber": 0.8,
    "estimated": true
  },
  {
    "id": "preset-20261020-075",
    "name": "梅菜扣肉",
    "category": "小炒菜",
    "calories": 420,
    "fiber": 1.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-076",
    "name": "牛肉炒笋",
    "category": "高蛋白",
    "calories": 145,
    "fiber": 1.4,
    "estimated": true
  },
  {
    "id": "preset-20261020-078",
    "name": "粉丝蒸生蚝",
    "category": "高蛋白",
    "calories": 135,
    "fiber": 0.2,
    "estimated": true
  },
  {
    "id": "preset-20261020-079",
    "name": "红烧狮子头",
    "category": "小炒菜",
    "calories": 270,
    "fiber": 0.4,
    "estimated": true
  },
  {
    "id": "preset-20261020-080",
    "name": "清蒸鲈鱼",
    "category": "高蛋白",
    "calories": 110,
    "fiber": 0.1,
    "estimated": true
  },
  {
    "id": "preset-20261020-081",
    "name": "香菇滑鸡",
    "category": "高蛋白",
    "calories": 155,
    "fiber": 0.8,
    "estimated": true
  },
  {
    "id": "preset-20261020-082",
    "name": "冬瓜丸子汤",
    "category": "炖汤",
    "calories": 55,
    "fiber": 0.3,
    "estimated": true
  },
  {
    "id": "preset-20261020-084",
    "name": "香干炒芹菜",
    "category": "小炒菜",
    "calories": 110,
    "fiber": 1.5,
    "estimated": true
  },
  {
    "id": "preset-20261020-088",
    "name": "土豆烧排骨",
    "category": "小炒菜",
    "calories": 195,
    "fiber": 0.6,
    "estimated": true
  },
  {
    "id": "preset-20261020-090",
    "name": "干煸肥肠",
    "category": "小炒菜",
    "calories": 310,
    "fiber": 0.6,
    "estimated": true
  },
  {
    "id": "preset-20261020-092",
    "name": "虾仁滑蛋",
    "category": "高蛋白",
    "calories": 145,
    "fiber": 0.1,
    "estimated": true
  },
  {
    "id": "preset-20261020-093",
    "name": "苦瓜炒蛋",
    "category": "减脂菜",
    "calories": 100,
    "fiber": 1,
    "estimated": true
  },
  {
    "id": "preset-20261020-095",
    "name": "小炒黄牛肉",
    "category": "高蛋白",
    "calories": 175,
    "fiber": 0.8,
    "estimated": true
  },
  {
    "id": "preset-20261020-096",
    "name": "笋干烧肉",
    "category": "小炒菜",
    "calories": 285,
    "fiber": 2,
    "estimated": true
  },
  {
    "id": "preset-20261020-097",
    "name": "木耳炒肉片",
    "category": "小炒菜",
    "calories": 160,
    "fiber": 1.1,
    "estimated": true
  },
  {
    "id": "preset-20261020-098",
    "name": "清蒸排骨",
    "category": "高蛋白",
    "calories": 250,
    "fiber": 0.1,
    "estimated": true
  }
,
  ...EXTRA_DISHES
];

const PRESET_BY_NAME = new Map(PRESET_DISHES.map(dish => [dish.name, dish]));

export { PRESET_DISHES, CATEGORY_ORDER, EXTRA_DISHES, PRESET_SHOPS, PRESET_RECIPES, PRESET_BY_NAME };
