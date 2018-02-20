import { Injectable } from '@angular/core'
import mysql = require('mysql')
import * as mysqlConfig from './mysql.config'

@Injectable()
export class DatabaseService {
  public con;
  config;


  constructor(
  ) {
    this.config = mysqlConfig.config
    this.con = mysql.createConnection(this.config)
  }

  dbConnection() {
    return new Promise((resolve, reject) => {
      this.con.connect((err) => {
        if (err) {
          this.dbDisconnection()
          this.con = undefined;
          reject(err);
        }
        resolve();
      });


    });
  }

  dbDisconnection() {
    if (this.con) {
      this.con.end((err) => {
      });
    }
  }

  readDBFromTable(table: string) {
    this.con.query(`SELECT * FROM ${table}`, (err, rows) => {
      if (err) throw err;

      console.log('Data received from Db:\n');
      console.log(rows);
    });
  }
}
