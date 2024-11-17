---
name: "Code: The Hidden Language of Computer Hardware and Software, 2nd Edition"
altname: Code
author: Charles Petzold
published: 2022
type: Non-Fiction
genre:
  - Computer Science
  - Programming
  - Technology
rating: 🌕🌕🌕🌗🌑
status: Completed
date: 2024-03-15 17:30:03 -0500
updated: 2024-08-11 10:43:44 -0500
---

![[code.jpg|300]]

Book URL: [Code](https://www.goodreads.com/book/show/44882.Code)

### Chapter 1: Best Friend

Goal: Communicate with friend that across the street without electronic devices

Solution: Use flashlight to encode the characters of the alphabet  
System that uses dots and dashes for encoding characters - Morse Code

Code is a system for transferring information among people

Key point: 2 symbols are used to represent all the characters

### Chapter 2: Codes and Combinations

It is easier to send Morse code than receive it  
The main reason being the lack of a Morse Code to Alphabet lookup table  

Number of codes = $2^{No.\;of\;dots\;and\;dashes}$  
Morse Code is a binary code as it only uses dots and dashes

### Chapter 3: Braille and Binary Codes

Braille at the age of 3 stuck a pointed tool in his eyes  
The wound become infected and spread to his other eyes leaving him blind  
The main hurdle to education for blind people was lack of accessible material   

A professor at the school of Blind Youth in Paris created a system that used embossed letters that could be read by touch, this system was difficult to use  

A captain in the French army had created a system that used a pattern of raised dots on paper to pass notes that could be read at night without any light  
At the age of 12, Braille learnt about this system and created a modified version that could be used in the classroom setting by the age of 15  

Braille uses dots in a two-by-three cell to represent characters  
With 6 positions we can represent $2^6 = 64$ unique characters

A code that change the interpretation of codes that follow it called a **shift** code  
A code that only modifies the next code in the sequence is called a **escape** code

The braille that is commonly used today is called Braille Grade 2  
A system that uses 8 dots was also created to represent more characters  

### Chapter 4: Anatomy of a Flashlight

Light bulb has a tungsten filament that glows when electricity is applied  
The filament is placed in a inert gas to prevent the tungsten from burning up  

Atoms consist of neutrons, protons and electrons  
An atom is an an stable state when there are equal protons and electrons 

During storms the bottom of clouds accumulate electrons and the top of the clouds lose electrons. The imbalance is evened out with a lightening bolt. Lightening is a lot of electrons moving quickly from one place to another

The electricity in a circuit is the passing of electron from atom to atom  

Batteries generate electricity using a chemical reaction. The chemicals chosen are such that it create an extra electrons on the negative terminal (anode) and demand electrons on the positive terminal (cathode)

When wires are connected to the ends of the battery a circuit is created that allows the electrons from the anode to travel to the cathode (Counter-clockwise). All electrons wherever they are found are the same.

When 2 batteries are connected in series the voltage add up  
When 2 batteries are connected in parallel the life of the circuit increases  

Electrons are present around the nucleolus in various levels called shells. Some elements have a single electron in their outer most shell which they can loose easily. These elements are called conductors. Elements that do not loose their electrons easily are called insulators.

Dry air is a bad conductor of electricity (high resistance). However just about anything will conduct electricity if the voltage is high enough. 

Longer the wire the higher the resistance, thicker the wire the lower the resistance.

Voltage is the potential for doing work. Voltage exists even when something is not hooked up to a battery. It is the force that pushes electrons through a circuit. The chemical reaction that occurs inside the battery create a potential difference

Current is the measure of the numbers of electrons moving around in the circuit  
1 Amp = 6.242 * $10^{18}$ electrons moving per sec past a point  

Ohms law provides relation between current, resistance and voltage
$$I = \frac{V}{R}$$
If a battery is not connected to a circuit (surrounded with air) the resistance is very high, so the current is almost zero (Voltage divided by a very large value)  
If the ends of the battery are connected together using a wire then the value of R is very small, so the current is very high (Voltage divided by a very small value). This is known as a short circuit

Watt is the measure of power ($P = V \times I$)  
It is the rate at which 1 Amp of electrons flow through a voltage of 1 V   
Electricity bills are based on wattage used  

A switch is used to control the electricity flowing through a circuit  
It can either be on or off similar to a binary code

### Chapter 5: Communicating Around Corners

Flashlight can only be used for line of sight communication  

To communicate with friend who stays in the adjacent house we can create a circuit with a light bulk to be used for communication using Morse Code  
If your friend also creates a similar system to communicate with us we end up with a bidirectional **telegraph** system  

The part of the cable that is shared by the two circuits is called **common**  

![[telegraph-system.png|540]]

Electric connection with the earth is called **earth** (UK) or **ground** (US)  
A copper pole that is at least 8 feet long and 1/2 inch in diameter is required  
Since earth is very large it can acts as a good conductor  

![[circuit-with-ground.png|480]]

Circuits are always closed loops  
While the below diagram does not look like a closed loop it is a complete circuit

![[simplified-telegraph-circuit.png|520]]

V in the diagram stands for Voltage we can also think of it as Vacuum  
The vacuum sucks electrons from the the electron rich ground (earth)

The thickness of a wire is measured in American Wire Gauge (AWG)  
Small AWG number represents a thick wire. Think wires have lower resistance  
A 20-gauge wire has a diameter of 0.032 inches and has a resistance of 10 ohms per 1000 feet (or 1 ohm for every 100 feet)  

If our friends house was more than a mile away we would not be able to light the bulb using a 3V battery as the resistance of the wires also has to be considered  

One way to overcome this issue is to use a thicker cable. A 10-guage wire has a diameter of 0.1 inches and has a resistance of 1 ohm per 1000 feet  
Another option is to increase the voltage and use a lightbulb of higher resistance  

### Chapter 6: Logic with Switches

Conventional algebra always deals with numbers  
**Commutative Law**: $A + B = B + A$ (True for multiplication as well)  
**Associative Law**: $A + (B + C) = (A + B) + C$ (True for multiplication as well)  
**Distributive Law**: $A \times (B + C) = (A \times B) + (A \times C)$

In Boolean algebra operands are not numbers instead they where classes (sets)  
A class represents a group of similar items  
+: Union of classes (OR)  
$\times$: Intersection of classes (AND)  

The commutative, associative and distributive laws are all true in Boolean algebra  
In Boolean algebra addition is also distributive over multiplication  

1: Universe class (Class of everything)  
-: Exclude classes from the universal class  
0: Empty class (Class of nothing)  

Boolean Algebra can also be represented using circuits  
[Chapter 6 - Boolean Circuits](https://codehiddenlanguage.com/Chapter06/)

### Chapter 7: Telegraphs and Relays

Telegraph literally means “far writing”  

The early telegraphs relied on the concept of electromagnetism  
Metals behaving like magnets when electricity is passed through them  
The receiving end of the telegraph had a electromagnet that would place below a vertical bar that could move up and down which would cause a sound to be produced that would represent a dot and dash   

![[telegraph-station.png|600]]

The major disadvantage of this system was that to transmit signals to large distance we would need a circuit that has very high voltage  

A solution to this would be to use replays the repeat the signal after some distance  
Relays take the input signal amplify it and procedure it as the output  

### Chapter 8: Relays and Gates

Computers at its core is a synthesis of Boolean Algebra and Electricity  
This medaling of math and hardware is called Logic Gates

![[replay-circuit.png|500]]

The output of one relay can be used as the input to another relay  
Similar to switches Relays can also be connected in Series  

![[replay-circuit-series.png|440]]

Both the switches need to be closed to light up the bulb  
This circuit forms the basis of an AND gate  

[Chapter 8 - Logic Gates](https://codehiddenlanguage.com/Chapter08/)

![[three-input-and-gate.png|400]]

Connecting these relays in parallel gives us the OR gate  
The relays that have been used so far are called double throw relays  

By reversing the contact to which the output is connected we can create a relay that is always on and is turned off when an voltage is applied  
A relay wired this way is called an invertor. It represents an NOT gate

![[reversed-relay.png|400]]


2 relays connected in series with normally closed output produces the NOR gate  
2 relays connected in parallel with normally closed output produces the NAND gate  

Lastly there is buffer (a relay). On its own it does not do anything  
Buffers are used to amplify weak signals  

![[truth-table-logic-gates.png|500]]

Using a NAND or NOR gates all the other gates can be created  

### Chapter 9: Our Ten Digits

I: One  
V: Five  
X: Ten  
L: Fifty  
C: Hundred  
D: Five hundred  
M: Thousand  

Roman Numerals were widely used but they were difficult for complex calculations like multiplication and division  
The system that we use today is the Indo-Arabic numbers system    

### Chapter 14: Adding with Logic Gates

NAND & OR with the same and output through AND gate = XOR

AND Gate: Sum Bit  
XOR Gate: Carry Bit

AND and XOR with same input = Half Adder  
2 Half Adder + OR Gate = Full Adder (Carry from previous column)  

### Chapter 15: Is This for Real?

An amplifier can be created using a NPN transistor  
Transistor consists of a collector, base and emitter  

### Chapter 17: Feedback and Flip-Flops

Flip-Flops can remember the last circuit which was closed  
