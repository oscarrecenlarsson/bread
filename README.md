# node-assignment-2

I den sista inlämningsuppgiften ska ni ta fram en blockchain lösning som inte hanterar kryptovalutor. Utan istället ska ni få fria händer att skapa en blockchain lösning för andra typer av behov.

För G krävs följande:

Användning av hashning via SHA256
ProofOfWork
Manipulering av blockkedjan via ett API
Blockkedjan ska ha stöd för minst 3 noder i ett distribuerat nätverk.

För VG krävs:

Att “best practices” används, vilket innebär att Single Responsible Principles samt Separations Of Concern ska användas.
Detta betyder till exempel att logiken för ett API ska separeras i Controller funktioner, Routing funktioner.

Min tanke är att skapa en logistik-blockchain med ett REST-api för att hantera försändelser mellan olika noder.

Exempel-request för att lägga till en ny shipment
{"route": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"], "products": ["prod1", "prod2", "prod3"]}

Jag har lagt till en postman collection json du kan testköra också
