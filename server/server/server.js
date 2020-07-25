const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const storage = require("node-persist");

const server = express();
server.use(express.json());
server.use(bodyParser.json());
server.use(cors());

const port = 4000;

(async() => {

    await storage.init({dir: "./data"});

    // let v = {
    //     id: uuidv4(),
    //     registrationPlateNumber: "BM58IR",
    //     yearBuilt: "1968",
    //     make: "Camry",
    //     model: "Toyota",
    //     engineNumber: "8534976549673",
    //     VIN: "5754BHS78BFDBD0A"
    // };
    // await storage.setItem(`vehicle-${v.id}`,v); store vehicle

    // for (let c of customers) {
    //     let cuuid = uuidv4();
    //     let customer = {id:cuuid, ...c};
    //     let customerStorageKey = `customer-${cuuid}`;
    //     await storage.setItem(customerStorageKey,customer); 
    // } // Seeding the data into node-persist

    server.get("/customers",async(req,res)=>{
        let customers = await storage.valuesWithKeyMatch(/customer-/);
        res.json(customers);
    });
    server.get("/vehicles",async(req,res)=>{
        let vehicles = await storage.valuesWithKeyMatch(/vehicle-/);
        res.json(vehicles);
    });
    server.get("/notices-of-disposals",async(req,res)=>{
        let nods = await storage.valuesWithKeyMatch(/nod-/);
        res.json(nods);
    });
    //Application for Registration - links customer to vehicle and the date that it occurred
    server.post("/notices-of-disposals", async(req,res) => {
        let customer = await storage.getItem(`customer-${req.body.customerId}`);
        if(customer === undefined) {
            res.json({status:400, message:"Invalid customer ID provided"});
            return;
        }
        let vehicle = await storage.getItem(`vehicle-${req.body.vehicleId}`);
        if(vehicle === undefined) {
            res.json({status:400, message:"Invalid vehicle ID provided"});
            return;
        }
        let nod = {
            id: uuidv4(),
            customerId: customer.id, //We already used line 31 to allow for "cusomer.id" to be entered here, same w/ vehicle
            vehicleId: vehicle.id,
            establishDate: new Date().toISOString().slice(0,10)
        }
        await storage.setItem(`nod-${nod.id}`,nod); // stored nod
        res.json(nod);  
    });

    //Add Customer
    server.post("/customers",async(req,res)=>{
        let data = req.body;
        let customer = {id: uuidv4(), ...data, establishDate: new Date().toISOString().slice(0,10)};
        await storage.setItem(`customer-${customer.id}`, customer);
        res.json({status:200,data:customer});
    });
    
    server.listen(port, () => console.log(`Server listening at port ${port}`));
})();
