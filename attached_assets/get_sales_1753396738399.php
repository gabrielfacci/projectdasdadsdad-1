<?php
function get_sales($start_date_sale, $end_date_sale) {
    $url = 'https://app.perfectpay.com.br/api/v1/sales/get';
    $headers = array(
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: ' . 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiN2YwMTUxZTlkM2U5Y2RkNzhlMmY3MTFjOTdmN2VlY2RjOTU5MjIyZTE4NDgzNmYyMmY4Y2YzZGE3M2E4YTJlMWI0MDE2ZjI1OThkODQ2OTUiLCJpYXQiOjE3MTcwMDc1OTIuNTM0MzcxLCJuYmYiOjE3MTcwMDc1OTIuNTM0Mzc3LCJleHAiOjE4NzQ3NzM5OTIuNTI1MjUzLCJzdWIiOiIxMDcwMzcxIiwic2NvcGVzIjpbImludGVncmF0aW9uIl19.qIB953VS982OIkKcgESd-_yuMwQz6XReM87UcQuZ0UViAty870c0enmsKGxxpNVvpm-8sPaq2c79REqwidNRRXYKRVByNoheyOnn7iElszM0f4C1ddAeAG5avDVOlBdI4B8QoTqmhENrV02N-rjKsp9fx6Gg3rXjsUWqrvhgVdjsr0__eByQK0V8Dki6Qa0_CcMiW0GkuCjKq_lgTFF3al7nY4AHB_z08wncwmkN5fARM-Ix2A4K01PYlKr8pOzzqcVeLifGKwqdxwnFLKiGZodbJHUfGWaNNDLILSfngwhGWeTnd7hH_3PtbQUXKWUTVw0VSN0Td6EJCWHRm4wpNFXOIni0bNei57su7SeDKmvRoySdgfbnh_tR8cbgJPc67AK4UZ2Go-VM7ZY1HhToyv0JbsUa1_YlThdzmRwJj9tA7WSx-j073gTVHOlmhgLL2XK5Gq9xNhitOTjcEIew9YseiwtBlAdwipOCltNI1QtegKYqxhrX_LvtowBi6hYqUikN9h2e9Q2Z23qYmAYEWZw0pdPMxYoTl4Vwt8a1MMavDdErNRYrAci3XxeOMTBGUbWbUBwk2W9omTCMgdnsBcPvXCEgFyRWekmZHzhrXeBg2ncerSnnfb0oj9d79DT2OiXdSBg-hp7FyDiKrIkocrJ1yChUKep0OSfZE0wEhdk'
    );
    $params = array(
        'start_date_sale' => $start_date_sale,
        'end_date_sale' => $end_date_sale,
        'sale_status' => [2, 7],  // Aprovado e Devolvido
        'page' => 1
    );
    $data_string = json_encode($params);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/sales_api_response.log', 'Curl error: ' . curl_error($ch) . "\n", FILE_APPEND);
    }
    curl_close($ch);

    // Log the result for debugging
    file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/sales_api_response.log', $result . "\n", FILE_APPEND);

    return json_decode($result, true);
}
?>
