/* Course content for the Piggo electric motorbike.
   Numbers marked "typical" are general electric-scooter figures, not Piggo specifications. */

export const GROUPS = { shell: 'Outer parts', hidden: 'Hidden systems (x-ray)' };

export const PARTS = {
  body: {
    name: 'Body and frame', group: 'shell', system: 'Structure',
    short: 'The step-through chassis that carries the rider and holds every other part.',
    what: 'The body is the backbone of the scooter. Under the painted panels sits a structural frame, usually pressed steel or aluminium on electric scooters. The panels you see (leg shield, floor, seat cowl) shape the airflow and protect the battery and electronics from water and dirt.',
    how: [
      'The step-through shape lets the rider walk in over a low floor instead of swinging a leg over a tank.',
      'Heavy parts such as the battery sit low and near the middle, which keeps the centre of gravity low and the scooter stable.',
      'The seat lifts or removes to give access to the battery bay.'
    ],
    facts: [['Layout', 'Step-through'], ['Typical frame', 'Steel or aluminium'], ['Panels', 'Cosmetic and protective']],
    watch: 'Cracked panels let water reach the electronics. Check them after any fall.',
    cam: [[5.2, 2.2, 3.2], [0, 0.85, -0.1]]
  },
  fork: {
    name: 'Front fork', group: 'shell', system: 'Steering and ride',
    short: 'Two telescoping legs that hold the front wheel and soak up bumps.',
    what: 'A telescopic fork is two tubes that slide inside each other. A spring inside carries the weight and a damper (oil and a valve) stops the spring from bouncing. The front wheel and front brake caliper bolt to the lower legs.',
    how: [
      'A bump pushes the wheel up. The slider compresses the spring and absorbs the shock.',
      'Oil forced through small holes in the damper slows the movement, so the wheel settles instead of bouncing.',
      'Under hard braking weight shifts forward and the fork compresses. This is called brake dive.'
    ],
    facts: [['Type', 'Telescopic'], ['Main parts', 'Stanchion, slider, spring, damper'], ['Also carries', 'Front wheel and brake']],
    watch: 'Oil on the fork legs means a leaking seal. Do not ride until it is fixed.',
    cam: [[2.9, 1.1, 3.6], [0, 0.5, 1.4]]
  },
  bars: {
    name: 'Handlebar and controls', group: 'shell', system: 'Steering and control',
    short: 'Steering, throttle, brake levers, mirrors, lights and the display.',
    what: 'The handlebar turns the fork through the steering stem and head bearings. Every rider command starts here: the twist grip asks for power, the levers ask for braking, and the switches control lights and indicators.',
    how: [
      'Turning the bars rotates the fork around the steering axis, so the front wheel points where you want to go.',
      'The throttle grip holds a magnet and a Hall sensor. The sensor turns grip angle into a small voltage the controller can read.',
      'Each brake lever has a cut-off switch that tells the controller to stop driving the motor while you brake.'
    ],
    facts: [['Throttle signal', 'Typically about 0.8 to 4.2 V'], ['Brake cut-off', 'Switch in each lever'], ['Also here', 'Mirrors, headlight, display']],
    watch: 'A throttle that does not return to zero is a safety fault. Stop and inspect.',
    cam: [[2.4, 2.6, 3.6], [0, 1.7, 0.9]]
  },
  fwheel: {
    name: 'Front wheel and tyre', group: 'shell', system: 'Wheels and brakes',
    short: 'The steered wheel. It does most of the braking.',
    what: 'The wheel is a rim, spokes or cast arms, a hub with two bearings, and a tyre. A brake disc is bolted to the hub. The front wheel steers and is not driven, so it spends its effort on grip and braking.',
    how: [
      'When you brake, weight moves forward and presses the front tyre harder into the road. That is why the front brake can do most of the stopping.',
      'Hub bearings let the wheel spin on its axle with very little friction.',
      'The tyre tread and pressure set how much grip you have, in the dry and in the wet.'
    ],
    facts: [['Role', 'Steering and braking'], ['Driven?', 'No'], ['Tyre pressure', 'Read it on the tyre sidewall or manual']],
    watch: 'Low tyre pressure makes steering heavy and cuts range.',
    cam: [[2.6, 0.8, 3.7], [0, 0.35, 1.45]]
  },
  rwheel: {
    name: 'Rear wheel', group: 'shell', system: 'Wheels and brakes',
    short: 'The driven wheel. The motor pushes the scooter through it.',
    what: 'The rear wheel carries more of the rider weight and receives the drive. On this style of scooter the drive unit sits at the rear hub, so there is no chain or belt to maintain.',
    how: [
      'Torque from the motor turns the wheel and the tyre pushes backwards on the road. The road pushes the scooter forward.',
      'A swing arm joins the wheel to the frame and moves up and down on the rear shock.',
      'The rear brake is gentler than the front, but useful for staying stable at low speed.'
    ],
    facts: [['Role', 'Drive'], ['Driven?', 'Yes'], ['Attached by', 'Swing arm and rear shock']],
    watch: 'Wheel wobble or a hum from the hub can mean worn bearings.',
    cam: [[-2.6, 0.9, -3.6], [0, 0.35, -1.1]]
  },
  rsus: {
    name: 'Rear suspension', group: 'shell', system: 'Steering and ride',
    short: 'A coil spring and damper that keep the rear tyre on the road.',
    what: 'The rear shock has a coil spring wrapped around a damper. It sits between the swing arm and the frame. The spring supports the load and the damper controls how fast the spring moves.',
    how: [
      'Compression: a bump pushes the wheel up and the spring squeezes.',
      'Rebound: the spring pushes the wheel back down. The damper slows this so the wheel does not bounce.',
      'Many shocks have a preload ring. Tightening it raises the ride height for a heavy rider or a passenger.'
    ],
    facts: [['Spring', 'Coil'], ['Damper', 'Oil'], ['Adjust', 'Preload (on many models)']],
    watch: 'A shock that bounces more than once after a bump has lost its damping.',
    cam: [[-2.4, 1.3, -3.2], [0, 0.65, -0.8]]
  },

  battery: {
    name: 'Battery pack', group: 'hidden', system: 'Power',
    short: 'Lithium-ion cells that store the energy for the whole ride.',
    what: 'The pack is many small lithium-ion cells joined in series (to raise voltage) and parallel (to raise capacity). It sits low and central so the weight does not upset handling.',
    how: [
      'Energy in watt-hours = voltage x amp-hours. A 60 V, 30 Ah pack holds 1,800 Wh.',
      'Range is energy divided by consumption. At 20 Wh per km, that pack gives about 90 km (example only).',
      'Charging between roughly 20% and 80% is gentler on the cells than always going to 100% or to empty.'
    ],
    facts: [['Chemistry', 'Lithium-ion'], ['Typical voltage', '48 to 72 V'], ['Energy', 'V x Ah = Wh']],
    watch: 'Swelling, a burning smell or unusual heat means stop using the pack and contact a technician.',
    cam: [[5.0, 1.6, 1.6], [0, 0.75, -0.5]]
  },
  bms: {
    name: 'Battery management system', group: 'hidden', system: 'Power',
    short: 'The small circuit board that guards and balances the battery.',
    what: 'The BMS watches every group of cells. It measures voltage, current and temperature, and cuts the pack off if anything leaves a safe range.',
    how: [
      'Over-charge and over-discharge protection stops cells being pushed past their limits.',
      'Cell balancing bleeds a little charge from the fullest cells so all of them stay level.',
      'It reports state of charge to the display so you can see how much range is left.'
    ],
    facts: [['Protects against', 'Over-charge, over-discharge, over-current, short circuit'], ['Also does', 'Cell balancing'], ['Sensors', 'Voltage, current, temperature']],
    watch: 'If the scooter cuts out suddenly on a hill, the BMS may be protecting a weak cell.',
    cam: [[3.6, 1.5, 1.4], [0, 0.75, 0]]
  },
  motor: {
    name: 'Hub motor', group: 'hidden', system: 'Drive',
    short: 'A brushless motor built into the rear wheel hub.',
    what: 'A brushless DC (BLDC) motor has coils on a fixed stator and permanent magnets on a rotor. In a hub motor the rotor is the outer shell, which is bolted to the wheel. Energising the coils in turn pulls the magnets round.',
    how: [
      'The controller switches current through three groups of coils in a repeating order.',
      'Hall sensors tell the controller where the magnets are, so the switching stays in step with the rotor.',
      'More current gives more torque. Power = voltage x current, so a 60 V motor drawing 50 A uses 3,000 W.',
      'Run in reverse as a generator, the motor can send energy back to the battery. This is regenerative braking.'
    ],
    facts: [['Type', 'Brushless DC'], ['Moving parts', 'Rotor with magnets'], ['Typical power', '1 to 4 kW']],
    watch: 'A burning smell or a motor that stutters at low speed can point to a damaged coil or Hall sensor.',
    cam: [[-3.4, 0.9, -2.6], [0, 0.33, -1.06]]
  },
  controller: {
    name: 'Motor controller', group: 'hidden', system: 'Drive',
    short: 'The electronics that turn battery power into smooth motor power.',
    what: 'The controller reads the throttle and brake signals, then switches battery current into the three motor phases many thousands of times a second. It is the brain between the rider and the motor.',
    how: [
      'Power transistors (MOSFETs) switch on and off very fast. Changing how long they stay on (PWM) changes the average power.',
      'It limits current, so a sudden throttle twist cannot overload the battery or motor.',
      'It watches its own temperature and reduces power if it gets too hot.'
    ],
    facts: [['Input', 'Throttle, brake, Hall sensors'], ['Output', 'Three-phase drive'], ['Method', 'PWM']],
    watch: 'Water in the controller bay is a common failure. Avoid deep puddles and pressure washing.',
    cam: [[3.5, 1.9, 2.8], [0, 0.95, 0.62]]
  },
  port: {
    name: 'Charge port', group: 'hidden', system: 'Power',
    short: 'The sealed socket where the charger plugs in.',
    what: 'The charger changes mains AC into DC at the battery voltage. It charges with constant current first, then holds constant voltage as the cells fill. The charge port passes that power to the BMS and battery.',
    how: [
      'Constant current: the charger pushes a fixed current until the pack reaches its target voltage.',
      'Constant voltage: the voltage holds steady and the current tapers off to nearly zero.',
      'A rubber cover and seal keep rain and dust out of the contacts.'
    ],
    facts: [['Charge stages', 'Constant current, then constant voltage'], ['Input', 'Mains AC'], ['Output', 'DC at pack voltage']],
    watch: 'Wet or dirty contacts can overheat. Dry the port before charging.',
    cam: [[-1.8, 1.5, -3.8], [0, 0.93, -1.4]]
  },
  brakes: {
    name: 'Brake system', group: 'hidden', system: 'Wheels and brakes',
    short: 'Discs, calipers and lines that turn motion into heat.',
    what: 'Each brake has a disc on the wheel and a caliper with two pads. A lever pull sends force along a cable or hydraulic line to squeeze the pads against the disc. Friction slows the wheel and warms the disc.',
    how: [
      'Hydraulic fluid cannot be compressed, so a small lever movement makes a strong, even clamp.',
      'Kinetic energy becomes heat in the disc. Faster speed means much more energy to remove.',
      'Pad material wears away over time and must be replaced before it reaches the metal.'
    ],
    facts: [['Parts', 'Lever, line, caliper, pads, disc'], ['Energy', 'Motion to heat'], ['Pairs with', 'Regen braking']],
    watch: 'A soft lever or a squeal under braking means the pads or fluid need attention.',
    cam: [[3.6, 0.9, 3.6], [0.1, 0.5, 1.5]]
  },
  harness: {
    name: 'Wiring harness', group: 'hidden', system: 'Control',
    short: 'The bundle of cables that joins power and signals together.',
    what: 'The harness links the controller, battery, motor, lights and switches. Thick cables carry the large motor current. Thin cables carry sensor and switch signals. Connectors are sealed against water.',
    how: [
      'High-current cables are thick so they do not heat up when the motor draws 50 A or more.',
      'Signal wires carry small voltages from the throttle, brake switches and Hall sensors.',
      'A fuse or breaker sits in the main power line to protect the wiring if something shorts.'
    ],
    facts: [['Power lines', 'Thick, high current'], ['Signal lines', 'Thin, low voltage'], ['Protection', 'Fuse or breaker']],
    watch: 'Chafed insulation near the steering head is a common cause of random faults.',
    cam: [[4.2, 1.6, 2.4], [0.1, 0.6, -0.2]]
  }
};

export const PART_ORDER = ['body', 'fork', 'bars', 'fwheel', 'rwheel', 'rsus', 'battery', 'bms', 'motor', 'controller', 'port', 'brakes', 'harness'];

/* ---------------- Course modules ---------------- */
export const MODULES = [
  {
    id: 'm1', title: 'Meet the Piggo', blurb: 'The three systems every electric motorbike is built from.',
    steps: [
      { title: 'Three systems', parts: ['body'], view: 'solid', text: ['An electric motorbike is simpler than a petrol one. It has no engine, gearbox, exhaust or fuel tank. Its parts fall into three systems.', 'Structure holds everything together. Drive and power moves the bike. Control tells it what to do.'] },
      { title: 'The shell', parts: ['body', 'bars', 'fork', 'fwheel', 'rwheel', 'rsus'], view: 'solid', text: ['What you can see from outside is the shell: body, handlebar, fork, wheels and rear suspension.', 'Spin the bike and tap each part. Which ones move when you steer? Which ones move over bumps?'] },
      { title: 'See inside', parts: ['battery', 'motor', 'controller'], view: 'xray', text: ['Switch to x-ray and the hidden systems appear: battery, motor and controller are the big three.', 'These internal parts are modelled as illustrations. Real positions differ a little between makers.'] }
    ],
    quiz: [
      { q: 'Which of these does an electric motorbike NOT need?', o: ['A battery', 'A fuel tank', 'A motor controller', 'Wheels'], a: 1, why: 'Electric bikes store energy in a battery, so there is no fuel tank.' },
      { q: 'Which system tells the bike how much power the rider wants?', o: ['Structure', 'Control', 'Cosmetic', 'Lighting only'], a: 1, why: 'Throttle, brake and sensor signals are the control system.' },
      { q: 'Why are heavy parts such as the battery placed low?', o: ['It looks better', 'It keeps the bike stable', 'It makes the bike louder', 'It saves paint'], a: 1, why: 'A low centre of gravity makes the bike steadier in corners.' }
    ]
  },
  {
    id: 'm2', title: 'Steering and control', blurb: 'How your hands tell the bike where to go and how fast.',
    steps: [
      { title: 'The handlebar', parts: ['bars'], view: 'solid', text: ['The handlebar is the main interface between rider and bike. It carries the grips, brake levers, mirrors, switches and the display.', 'Turning it rotates the steering stem, which turns the fork and the front wheel.'] },
      { title: 'The throttle', parts: ['bars', 'controller'], view: 'xray', text: ['A twist grip holds a magnet. A Hall sensor reads the magnet position and outputs a voltage.', 'The controller reads that voltage and decides how much current to send to the motor. A small twist means little current. A full twist means a lot.'] },
      { title: 'Brake cut-off', parts: ['bars', 'brakes', 'controller'], view: 'xray', text: ['When you pull a brake lever, a switch tells the controller to stop driving the motor.', 'This prevents the motor and brake from fighting each other.'] }
    ],
    quiz: [
      { q: 'What does the throttle grip actually send to the controller?', o: ['A fuel flow', 'A small voltage signal', 'A chain pull', 'Hydraulic oil'], a: 1, why: 'A Hall sensor turns grip angle into a voltage the controller reads.' },
      { q: 'Why do brake levers have a cut-off switch?', o: ['To turn on the lights', 'To stop the motor driving while braking', 'To charge the battery', 'To lock the steering'], a: 1, why: 'The controller cuts drive so motor and brakes do not fight.' },
      { q: 'Turning the handlebar rotates which part?', o: ['The battery', 'The rear shock', 'The front fork', 'The seat'], a: 2, why: 'The steering stem links the bars to the fork.' }
    ]
  },
  {
    id: 'm3', title: 'Suspension', blurb: 'Springs and dampers: why the bike stays comfortable and planted.',
    steps: [
      { title: 'Spring and damper', parts: ['fork', 'rsus'], view: 'solid', text: ['Every suspension unit has two jobs. A spring carries the weight. A damper controls how quickly the spring moves.', 'Without a damper, the bike would keep bouncing after every bump.'] },
      { title: 'Front fork', parts: ['fork'], view: 'solid', text: ['The telescopic fork slides in and out. The lower legs hold the wheel and brake caliper.', 'Under hard braking the fork compresses. This is called brake dive.'] },
      { title: 'Rear shock', parts: ['rsus', 'rwheel'], view: 'solid', text: ['The rear shock sits between the swing arm and the frame.', 'Compression squeezes the spring. Rebound pushes the wheel back down, slowed by the damper.'] }
    ],
    quiz: [
      { q: 'What does the damper do?', o: ['Stores energy', 'Controls how fast the spring moves', 'Charges the battery', 'Steers the wheel'], a: 1, why: 'The damper slows spring movement so the wheel does not bounce.' },
      { q: 'What is brake dive?', o: ['The rear lifting off', 'The front fork compressing under braking', 'A brake pad wearing out', 'A tyre puncture'], a: 1, why: 'Weight shifts forward and compresses the fork.' },
      { q: 'A shock that bounces repeatedly after one bump has lost its…', o: ['Paint', 'Damping', 'Battery', 'Lights'], a: 1, why: 'Worn damping cannot control the spring.' }
    ]
  },
  {
    id: 'm4', title: 'Wheels and brakes', blurb: 'Grip, bearings, discs and how motion becomes heat.',
    steps: [
      { title: 'Front and rear wheel', parts: ['fwheel', 'rwheel'], view: 'solid', text: ['The front wheel steers and brakes. The rear wheel drives.', 'Each has a rim, a hub with bearings, and a tyre. Tyre pressure sets grip, comfort and range.'] },
      { title: 'Brake discs', parts: ['brakes', 'fwheel'], view: 'xray', text: ['A disc is bolted to each hub. A caliper holds two pads either side of it.', 'Squeezing the pads creates friction. The bike\'s kinetic energy turns into heat in the disc.'] },
      { title: 'Why the front does more', parts: ['fwheel', 'fork'], view: 'solid', text: ['During braking, weight moves forward. The front tyre is pressed harder to the road, so it can grip more.', 'That is why the front brake provides most of the stopping power.'] }
    ],
    quiz: [
      { q: 'What does a brake mainly turn kinetic energy into?', o: ['Light', 'Sound', 'Heat', 'Voltage'], a: 2, why: 'Friction converts motion into heat.' },
      { q: 'Why can the front brake do most of the stopping?', o: ['It is bigger', 'Weight shifts forward onto the front tyre', 'It is cheaper', 'The rear has no brake'], a: 1, why: 'More weight on the front tyre means more grip.' },
      { q: 'Which wheel receives the drive from the motor on this bike?', o: ['Front', 'Rear', 'Both', 'Neither'], a: 1, why: 'The hub motor is in the rear wheel.' }
    ]
  },
  {
    id: 'm5', title: 'Battery and charging', blurb: 'Volts, amp-hours, watt-hours and keeping cells healthy.',
    steps: [
      { title: 'Cells in a pack', parts: ['battery'], view: 'xray', text: ['The pack is many lithium-ion cells joined together. Series connections add voltage. Parallel connections add capacity.', 'Energy in watt-hours is voltage multiplied by amp-hours.'] },
      { title: 'Doing the maths', parts: ['battery'], view: 'xray', text: ['Example: 60 V x 30 Ah = 1,800 Wh.', 'If the bike uses 20 Wh per km, then 1,800 / 20 = 90 km of range. Fast riding and hills raise the consumption and cut the range.'] },
      { title: 'The guard: BMS', parts: ['bms', 'battery'], view: 'xray', text: ['The battery management system watches voltage, current and temperature. It stops charging or discharging if a limit is crossed.', 'It also balances cells so none drift away from the others.'] },
      { title: 'Charging', parts: ['port', 'bms', 'battery'], view: 'xray', text: ['The charger converts mains AC to DC. It holds a constant current first, then a constant voltage as the pack fills.', 'Staying between about 20% and 80% charge is gentler on cells for daily use.'] }
    ],
    quiz: [
      { q: 'A 48 V, 20 Ah battery stores how much energy?', o: ['68 Wh', '960 Wh', '2,400 Wh', '9,600 Wh'], a: 1, why: '48 x 20 = 960 Wh.' },
      { q: 'What does the BMS protect against?', o: ['Rust', 'Over-charge and over-discharge', 'Flat tyres', 'Loose mirrors'], a: 1, why: 'It keeps every cell within safe voltage, current and temperature.' },
      { q: 'You have 1,500 Wh and use 25 Wh per km. About how far can you go?', o: ['30 km', '60 km', '90 km', '120 km'], a: 1, why: '1,500 / 25 = 60 km.' }
    ]
  },
  {
    id: 'm6', title: 'Motor and controller', blurb: 'How electricity becomes torque, and who decides how much.',
    steps: [
      { title: 'Inside a hub motor', parts: ['motor'], view: 'xray', text: ['A brushless motor has copper coils on a fixed stator and permanent magnets on a rotor. In a hub motor the rotor is the outer shell attached to the wheel.', 'When coils are energised in sequence, the magnets are pulled round and the wheel turns.'] },
      { title: 'The controller', parts: ['controller', 'motor'], view: 'xray', text: ['The controller is the brain. It switches power transistors thousands of times a second to feed three phases of current to the motor.', 'Hall sensors in the motor tell it where the magnets are, so the timing is right.'] },
      { title: 'Power and torque', parts: ['controller', 'battery', 'motor'], view: 'xray', text: ['Power = voltage x current. A 60 V system drawing 50 A delivers 3,000 W.', 'More current means more torque, but also more heat. The controller limits current to protect the parts.'] },
      { title: 'Regenerative braking', parts: ['motor', 'controller', 'battery'], view: 'xray', text: ['When you slow down, the motor can act as a generator. The controller guides that current back into the battery.', 'It recovers a little energy and reduces wear on the brake pads.'] }
    ],
    quiz: [
      { q: 'What does "brushless" mean?', o: ['The motor has no bristles to clean', 'No carbon brushes touch the rotor', 'The motor has no magnets', 'It has no wires'], a: 1, why: 'Electronic switching replaces brushes, so there is less wear.' },
      { q: 'A 72 V system draws 40 A. What is the power?', o: ['112 W', '1,800 W', '2,880 W', '3,600 W'], a: 2, why: '72 x 40 = 2,880 W.' },
      { q: 'What tells the controller where the rotor magnets are?', o: ['GPS', 'Hall sensors', 'The speedometer', 'The mirror'], a: 1, why: 'Hall sensors detect magnet position for correct switching.' }
    ]
  },
  {
    id: 'm7', title: 'Wiring and signals', blurb: 'Thick power cables, thin signal wires, and protection.',
    steps: [
      { title: 'Two kinds of wire', parts: ['harness'], view: 'xray', text: ['Power cables are thick because the motor can pull 50 A or more. A thin wire there would overheat.', 'Signal wires are thin. They carry tiny voltages from the throttle, brake switches and Hall sensors.'] },
      { title: 'Protecting the circuit', parts: ['harness', 'battery'], view: 'xray', text: ['A fuse or breaker in the main line opens if there is a short circuit.', 'Sealed connectors keep out rain, which is the most common source of random faults.'] },
      { title: 'Follow the signals', parts: ['bars', 'harness', 'controller'], view: 'xray', text: ['Throttle and brake signals travel from the handlebar down the harness to the controller.', 'The controller then decides what current the motor should receive.'] }
    ],
    quiz: [
      { q: 'Why are the main power cables thick?', o: ['Looks', 'To carry high current without overheating', 'To carry sound', 'To hold the bike together'], a: 1, why: 'Thin wire would overheat at high current.' },
      { q: 'What does a fuse do?', o: ['Boosts voltage', 'Opens the circuit during a short', 'Adds speed', 'Cools the motor'], a: 1, why: 'It breaks the circuit to protect the wiring.' },
      { q: 'Where do throttle signals end up?', o: ['The tyre', 'The controller', 'The mirror', 'The seat'], a: 1, why: 'The controller reads the throttle and drives the motor.' }
    ]
  },
  {
    id: 'm8', title: 'Plug to pavement', blurb: 'Follow the energy all the way from the wall socket to the road.',
    steps: [
      { title: 'Into the bike', parts: ['port', 'bms', 'battery'], view: 'xray', text: ['Energy enters through the charge port, passes the BMS and is stored in the battery pack as chemical energy.'] },
      { title: 'Out to the controller', parts: ['battery', 'harness', 'controller'], view: 'xray', text: ['When you ride, current flows from the battery along the harness to the controller. The controller shapes it according to the throttle.'] },
      { title: 'Into motion', parts: ['controller', 'motor', 'rwheel'], view: 'xray', text: ['The controller feeds the motor. The motor turns the rear wheel, and the tyre pushes against the road.'] },
      { title: 'And back again', parts: ['brakes', 'motor', 'battery'], view: 'xray', text: ['When you slow down, the brakes turn some energy into heat, and regenerative braking returns a part of it to the battery.'] }
    ],
    quiz: [
      { q: 'Put the flow in order: which comes first when riding?', o: ['Motor, then battery', 'Battery, then controller', 'Wheel, then battery', 'Controller, then charge port'], a: 1, why: 'Battery supplies the controller, which feeds the motor.' },
      { q: 'What does regenerative braking do?', o: ['Heats the brake disc more', 'Sends some energy back to the battery', 'Turns off the lights', 'Locks the wheel'], a: 1, why: 'The motor acts as a generator and charges the pack.' },
      { q: 'Which part sits between battery and motor?', o: ['Mirror', 'Controller', 'Seat', 'Tyre'], a: 1, why: 'It converts battery DC into the motor drive.' }
    ]
  }
];

/* energy path used in the sequencing game, in correct order */
export const POWER_PATH = [
  { id: 'port', label: 'Charge port', note: 'Mains AC becomes DC and enters the bike' },
  { id: 'bms', label: 'BMS', note: 'Checks every cell is safe to charge' },
  { id: 'battery', label: 'Battery pack', note: 'Stores the energy' },
  { id: 'controller', label: 'Controller', note: 'Shapes the current from the throttle' },
  { id: 'motor', label: 'Hub motor', note: 'Turns current into torque' },
  { id: 'rwheel', label: 'Rear wheel', note: 'Pushes the bike along the road' }
];

/* function-match pool */
export const MATCH = [
  ['fork', 'Soaks up bumps at the front'],
  ['bars', 'Steers and carries the throttle'],
  ['rsus', 'Spring and damper at the back'],
  ['battery', 'Stores energy as watt-hours'],
  ['bms', 'Balances and protects the cells'],
  ['motor', 'Turns current into torque'],
  ['controller', 'Switches power for the motor'],
  ['brakes', 'Turns motion into heat'],
  ['harness', 'Carries power and signals'],
  ['port', 'Where the charger plugs in'],
  ['fwheel', 'Steers and does most braking'],
  ['rwheel', 'Receives the drive']
];

/* part-hunt prompts */
export const HUNT_SHELL = ['body', 'fork', 'bars', 'fwheel', 'rwheel', 'rsus'];
export const HUNT_XRAY = ['battery', 'bms', 'motor', 'controller', 'port', 'brakes', 'harness'];
export const HUNT_CLUES = {
  body: 'Find the step-through body that carries the rider.',
  fork: 'Tap the telescopic fork that holds the front wheel.',
  bars: 'Tap the handlebar with the throttle and mirrors.',
  fwheel: 'Tap the front wheel, the one that steers.',
  rwheel: 'Tap the driven wheel at the back.',
  rsus: 'Find the coil spring and damper at the rear.',
  battery: 'Find the battery pack that stores the energy.',
  bms: 'Find the small green board that guards the cells.',
  motor: 'Tap the hub motor inside the rear wheel.',
  controller: 'Find the controller that switches motor power.',
  port: 'Find the charge port at the rear.',
  brakes: 'Tap a brake caliper.',
  harness: 'Tap the orange cable bundle (the wiring harness).'
};

/* quiz-rush question pool: all module questions */
export const RUSH = MODULES.flatMap(m => m.quiz);

export const LEVELS = [
  { xp: 0, name: 'Rider' }, { xp: 150, name: 'Mechanic' }, { xp: 400, name: 'Technician' }, { xp: 800, name: 'Engineer' }, { xp: 1400, name: 'Piggo Master' }
];
