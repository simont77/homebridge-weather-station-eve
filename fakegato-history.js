'use strict';

var homebridge;
var Characteristic;

module.exports = function(pHomebridge) {
	if (pHomebridge && !homebridge) {
		homebridge = pHomebridge;
		Characteristic = homebridge.hap.Characteristic;
    }
    
    var hexToBase64 = function(val) {
        return new Buffer((''+val).replace(/[^0-9A-F]/ig, ''), 'hex').toString('base64');
    }, base64ToHex = function(val) {
        if(!val) return val;
        return new Buffer(val, 'base64').toString('hex');
    }, swap16 = function (val) {
        return ((val & 0xFF) << 8)
            | ((val >> 8) & 0xFF);
    }, swap32 = function (val) {
        return swap16((val & 0xFFFF0000) >> 16) | swap16(val & 0x0000FFFF)<<16;
    },	hexToHPA = function(val) {
        return parseInt(swap16(val), 10);
    }, hPAtoHex = function(val) {
        return swap16(Math.round(val)).toString(16);
    }, numToHex = function(val, len) {
        var s = Number(val).toString(16);
        if(s.length % 2 != 0) {
            s = '0' + s;
        }
        if(len) {
            return ('0000000000000' + s).slice(-1 * len);
        }
    return s;
}

    class S2R1Characteristic extends Characteristic {
        constructor() {
            super('S2R1', 'E863F116-079E-48FF-8F27-9C2605A29F52');
            this.setProps({
                format: Characteristic.Formats.DATA,
                perms: [
                    Characteristic.Perms.READ, Characteristic.Perms.NOTIFY
                ]
            });
        }
    }

    class S2R2Characteristic extends Characteristic {
        constructor() {
            super('S2R2', 'E863F117-079E-48FF-8F27-9C2605A29F52');
            this.setProps({
                format: Characteristic.Formats.DATA,
                perms: [
                    Characteristic.Perms.READ, Characteristic.Perms.NOTIFY
                ]
            });
        }
    }

    class S2W1Characteristic extends Characteristic {
        constructor() {
            super('S2W1', 'E863F11C-079E-48FF-8F27-9C2605A29F52');
            this.setProps({
                format: Characteristic.Formats.DATA,
                perms: [
                    Characteristic.Perms.WRITE
                ]
            });
        }
    }

    class S2W2Characteristic extends Characteristic {
        constructor() {
            super('S2W2', 'E863F121-079E-48FF-8F27-9C2605A29F52');
            this.setProps({
                format: Characteristic.Formats.DATA,
                perms: [
                    Characteristic.Perms.WRITE
                ]
            });
        }
    }

    class FakeGatoHistoryService extends homebridge.hap.Service {
        constructor(accessoryType) {
            super("History", 'E863F007-079E-48FF-8F27-9C2605A29F52');
            switch (accessoryType)
            {
                case "weather":
                    this.accessoryType116 = "03";
                    this.accessoryType117 = "07";
                    break;
                case "energy":
                    this.accessoryType116 = "07";
                    this.accessoryType117 = "1f";
                    break;
                case "room":
                    this.accessoryType116 = "04";
                    this.accessoryType117 = "0f";
                    break;
            }
            
            
            this.accessoryType=accessoryType;
            this.lastEntry = 1;
            this.history = [];
            this.maxHistory = 100;
            this.currentEntry = 0;
            this.transfer=false;
            this.setTime=true;
            this.refTime=0;

            this.addCharacteristic(S2R1Characteristic);
                
            this.addCharacteristic(S2R2Characteristic)
                .on('get', (callback) => {
                    if ((this.currentEntry<=this.lastEntry) && (this.transfer==true))
                    {
                        
                        if (this.setTime==true)
                        {	
                            console.log("Data: "+ "15" + numToHex(swap16(this.currentEntry),4).toString('hex') + "0000 0000 0000 81" + numToHex(swap32(this.refTime),8) +"0000 0000 00 0000");
                            callback(null,hexToBase64('15' + numToHex(swap16(this.currentEntry),4) +' 0000 0000 0000 81' + numToHex(swap32(this.refTime),8) + '0000 0000 00 0000'));
                            this.setTime=false;
                        }
                        else
                        {	
                            console.log("Data: "+ "10 " + numToHex(swap16(this.currentEntry),4).toString('hex') + " 0000 " +numToHex(swap16(this.currentEntry),4).toString('hex') + " 0000 07 a60b 9c15 1302");
                            callback(null,hexToBase64('10' + numToHex(swap16(this.currentEntry),4)+ ' 0000 ' + numToHex(swap16(this.currentEntry),4) + ' 0000 07 a60b 9c15 1302'));
                        }
                        this.currentEntry++;
                    }
                    else
                        this.transfer=false;
                    
            });	
            
                
            this.addCharacteristic(S2W1Characteristic)
                .on('set', this.setCurrentS2W1.bind(this));
                
            this.addCharacteristic(S2W2Characteristic)
                .on('set', this.setCurrentS2W2.bind(this));

            
        }

        sendHistory(address){
            var hexAddress= address.toString('16');
            if (address!=0)
                this.currentEntry = address;
            else
                this.currentEntry = 0;
        }
        
        addEntry(entry){
            if (this.lastEntry<this.maxHistory)
            {
                if (this.refTime==0)
                    this.refTime=entry.time-978307200;
                this.history[this.lastEntry] = (entry);
                this.lastEntry++;
            }
            else
            {
                this.history[0] = (entry);
                this.lastEntry = 1;
            }

            this.getCharacteristic(S2R1Characteristic)
                .setValue(hexToBase64(numToHex(swap32(entry.time-this.refTime-978307200),8) + '00000000' + numToHex(swap32(this.refTime),8) + '0401020202' + this.accessoryType116 +'020f03' + numToHex(swap16(this.lastEntry)) +'ed0f00000000000000000101'));
            console.log("Last entry: "+ this.lastEntry.toString(16));
            console.log("116: " + numToHex(swap32(entry.time-this.refTime-978307200),8) + '00000000' + numToHex(swap32(this.refTime),8) + '0401020202' + this.accessoryType116 +'020f03' + numToHex(swap16(this.lastEntry)) +'ed0f00000000000000000101');

        }
        
        setCurrentS2W1(val, callback) {
            callback(null,val);
            console.log("Data request: "+ base64ToHex(val));
            var valHex = base64ToHex(val);
            var substring = valHex.substring(4,12);
            var valInt = parseInt(substring,16);
            var address = swap32(valInt);
            var hexAddress= address.toString('16');

            console.log("Address requested: "+ hexAddress);
            if (this.transfer==false)
            {
                this.transfer=true;
                this.sendHistory(address);
            }
        }
        
        setCurrentS2W2(val, callback) {
            console.log("Clock adjust: "+ base64ToHex(val));
            callback(null,val);
        }

        
    }

    return FakeGatoHistoryService;
}