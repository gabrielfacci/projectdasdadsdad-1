<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Adicionar Usuário</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
        }
        h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        form {
            display: flex;
            flex-direction: column;
        }
        label {
            margin-bottom: 5px;
        }
        input, select {
            margin-bottom: 15px;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
            box-sizing: border-box;
        }
        button {
            padding: 10px;
            font-size: 16px;
            background-color: #28a745;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            box-sizing: border-box;
        }
        button:hover {
            background-color: #218838;
        }
        .custom-select {
            height: auto;
            max-height: 150px; /* Ajuste a altura conforme necessário */
            overflow-y: auto;
        }
        .custom-select option {
            padding: 10px;
            cursor: pointer;
        }
        #popup {
            display: none;
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            text-align: center;
            width: 90%;
            max-width: 400px;
        }
        #popup button {
            margin-top: 20px;
            width: 100%;
            box-sizing: border-box;
        }

        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }
            input, select, button {
                font-size: 14px;
                padding: 8px;
            }
        }
    </style>
    <script>
        function showPopup(message) {
            const popup = document.getElementById('popup');
            popup.querySelector('p').textContent = message;
            popup.style.display = 'block';
        }

        function hidePopup() {
            const popup = document.getElementById('popup');
            popup.style.display = 'none';
            location.reload();
        }

        document.addEventListener('DOMContentLoaded', (event) => {
            const form = document.querySelector('form');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                fetch('process_add_user.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.text())
                .then(data => showPopup(data))
                .catch(error => showPopup('Ocorreu um erro ao adicionar o usuário.'));
            });

            const selectElement = document.getElementById('product_codes');
            const options = selectElement.options;

            selectElement.addEventListener('mousedown', function (e) {
                e.preventDefault();
                const option = options[e.target.index];
                option.selected = !option.selected;
            });
        });
    </script>
</head>
<body>
    <div class="container">
        <h2>Adicionar Usuário Manualmente</h2>
        <form>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>

            <label for="full_name">Nome Completo:</label>
            <input type="text" id="full_name" name="full_name" required>

            <label for="identification_type">Tipo de Identificação:</label>
            <select id="identification_type" name="identification_type" required>
                <option value="Stripe">Stripe</option>
                <option value="SuitPay">SuitPay</option>
                <option value="Outros">Outros</option>
            </select>
            
            <label for="identification_number">Número de Identificação:</label>
            <input type="text" id="identification_number" name="identification_number" required>
            
            <label for="status">Status da Compra:</label>
            <select id="status" name="status" required>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
            </select>
            
            <label for="product_codes">Selecione os Produtos:</label>
            <select id="product_codes" name="product_codes[]" class="custom-select" multiple required>
                <?php
                include 'db_config.php';
                $result = $conn->query("SELECT product_code, product_name FROM products");
                while ($row = $result->fetch_assoc()) {
                    echo "<option value='" . $row['product_code'] . "'>" . $row['product_name'] . "</option>";
                }
                ?>
            </select>
            
            <button type="submit">Adicionar Usuário</button>
        </form>
    </div>
    <div id="popup">
        <p></p>
        <button onclick="hidePopup()">OK</button>
    </div>
</body>
</html>
