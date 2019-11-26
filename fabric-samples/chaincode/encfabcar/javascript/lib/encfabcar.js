/*
 * SPDX-License-Identifier: Apache-2.0
 */
//AAAA



'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');
const password='encrypted';

class EncFabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const cars = [
            {
                color: 'blue',
                make: 'Toyota',
                model: 'Prius',
                owner: 'Tomoko',
            },
            {
                color: 'red',
                make: 'Ford',
                model: 'Mustang',
                owner: 'Brad',
            },
            {
                color: 'green',
                make: 'Hyundai',
                model: 'Tucson',
                owner: 'Jin Soo',
            },
            {
                color: 'yellow',
                make: 'Volkswagen',
                model: 'Passat',
                owner: 'Max',
            },
            {
                color: 'black',
                make: 'Tesla',
                model: 'S',
                owner: 'Adriana',
            },
            {
                color: 'purple',
                make: 'Peugeot',
                model: '205',
                owner: 'Michel',
            },
            {
                color: 'white',
                make: 'Chery',
                model: 'S22L',
                owner: 'Aarav',
            },
            {
                color: 'violet',
                make: 'Fiat',
                model: 'Punto',
                owner: 'Pari',
            },
            {
                color: 'indigo',
                make: 'Tata',
                model: 'Nano',
                owner: 'Valeria',
            },
            {
                color: 'brown',
                make: 'Holden',
                model: 'Barina',
                owner: 'Shotaro',
            },
        ];

        for (let i = 0; i < cars.length; i++) {

          cars[i].docType = 'car';
          let cipher = crypto.createCipher('aes-192-cbc', password);
          let encText = cipher.update(cars[i].owner, 'utf8', 'hex');
          encText += cipher.final('hex');
          cars[i].owner=encText;
          await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
          console.info('Added <--> ', cars[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }
    async queryCarDec(ctx, carNumber){
      let carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
      if (!carAsBytes || carAsBytes.length === 0) {
          throw new Error(`${carNumber} does not exist`);
      }
      let car = JSON.parse(carAsBytes.toString());
      let decipher = crypto.createDecipher('aes-192-cbc', password);
      let decText = decipher.update(car.owner, 'hex', 'utf8');
      decText += decipher.final('utf8');
      car.owner=decText;
      carAsBytes=Buffer.from(JSON.stringify(car));
      console.log(carAsBytes.toString());
      return carAsBytes.toString();


    }
    async queryCar(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async createCar(ctx, carNumber, make, model, color, owner) {
        console.info('============= START : Create Car ===========');
        let cipher = crypto.createCipher('aes-192-cbc', password);
        let encText = cipher.update(owner, 'utf8', 'hex');
        encText += cipher.final('hex');
        const car = {
            color,
            docType: 'car',
            make,
            model,
            owner:encText,
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Car ===========');
    }

    async queryAllCars(ctx) {
        const startKey = 'CAR0';
        const endKey = 'CAR999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        let car = JSON.parse(carAsBytes.toString());
        let cipher = crypto.createCipher('aes-192-cbc', password);
        let encText = cipher.update(newOwner, 'utf8', 'hex');
        encText += cipher.final('hex');
        car.owner = encText;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }

}

module.exports = EncFabCar;
