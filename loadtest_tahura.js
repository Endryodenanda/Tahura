import http from 'k6/http';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { check } from 'k6';
import {nik, api_key, username, password, base_url, grant_type, client_id, client_secret, keycloack_realm, keycloack_url, reservation_date, paymentMethod, code, name, price, series, quantity} from './env_tahura.js';
//import { format, formatDistance, formatRelative, subDays } from 'date-fns'

//format(new Date(), "'Today is a' eeee")
//=> "Today is a Monday"

//formatDistance(subDays(new Date(), 3), new Date(), { addSuffix: true })
//=> "3 days ago"

//formatRelative(subDays(new Date(), 3), new Date())
//=> "last Friday at 7:26 p.m."


export const options={
vus:1,
duration:"1s"
};

export default function() {
    //param header
    const paramHeaders = {
      "Content-Type": "application/json",
      "api-key": api_key,
    };
      
        // Perform login request to get bearer token
        const loginResponse = http.post(
          `${keycloack_url}/realms/${keycloack_realm}/protocol/openid-connect/token`,
          {
            username: username,
            password: password,
            grant_type: grant_type,
            client_id: client_id,
            client_secret: client_secret,
          }, paramHeaders 
        );
        // Extract bearer token from login response
        const token = loginResponse.json().access_token;
        console.log("Access Token: ", loginResponse.json().access_token);
      
        // Use bearer token to make authenticated requests
        const authHeaders = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "api-key": api_key,
        };

        const bodyPayload = {
           reservationDate : reservation_date,
           paymentMethod : paymentMethod,
           categories : [
            {
              code: code,
              name: name,
              price: price,
              series: series,
              quantity: quantity,
            }
          ]
        };

        const convData = JSON.stringify (bodyPayload);

        const myRequest = {
          headers: authHeaders
        };
      
        //console.log("Get Token: ", getProfileresponse.json().data.email);
        const getCategories = http.get(
            `${base_url}/v1/ticket/tahura/categories`,
            myRequest
          );

        const createOrder = http.post(
          `${base_url}/v1/ticket/tahura/orders`,
          convData, myRequest
        );

        const getInvoice = createOrder.json().data.invoice;

        check(createOrder, {
          "Status create is 200": (r) => r.status === 200
        });
        console.log(createOrder.json().bodyPayload);

        const getOrders = http.get(
          `${base_url}/v1/ticket/tahura/orders`,
          myRequest
        );

        const getOrdersInvoice = http.get(
          `${base_url}/v1/ticket/tahura/orders/${getInvoice}`,
          myRequest
        );

        //const date = new Date(2023, 07, 03)
       // const newDate1 = datefns.addDays(date, 2)
        //console.log(datefns.format(newDate1, 'yyyy-MM-dd'))

        check(loginResponse, {
          "Status retrieve is 200": (r) => r.status === 200
        });

        check(getOrders, {
          "Status Order is 200" : (r) => r.status === 200
        });

        check(getOrdersInvoice, {
          "Status Invoice is 200" : (r) => r.status === 200
        });

        console.log("Get status: ", createOrder);
        console.log("Get order : ", getOrders);
        console.log("Status Invoice :", getInvoice);
}



