export function generateAppointmentConfirmationEmailHtml(details: {
  clientName: string
  clientEmail: string
  fecha: string
  hora: string
  agenciaNombre: string
  agenciaDireccion: string
  pdfUrl: string // Simulated PDF URL
}) {
  const { clientName, clientEmail, fecha, hora, agenciaNombre, agenciaDireccion, pdfUrl } = details

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita BBVA</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-top: 5px solid #003366; /* BBVA Blue */
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            .header img {
                max-width: 150px;
                margin-bottom: 10px;
            }
            .header h1 {
                color: #003366; /* BBVA Blue */
                font-size: 24px;
                margin: 0;
            }
            .content {
                padding: 20px 0;
            }
            .content p {
                margin-bottom: 10px;
            }
            .details {
                background-color: #e6f2ff; /* Light BBVA Blue */
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
                border-left: 5px solid #0056b3; /* Darker BBVA Blue */
            }
            .details strong {
                color: #003366;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                margin-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #777;
            }
            .button {
                display: inline-block;
                background-color: #0056b3; /* BBVA Blue */
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
            .disclaimer {
                font-size: 10px;
                color: #999;
                margin-top: 20px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="/placeholder.svg?height=50&width=150" alt="BBVA Logo">
                <h1>Confirmación de Cita Bancaria</h1>
            </div>
            <div class="content">
                <p>Estimado/a <strong>${clientName}</strong>,</p>
                <p>Le confirmamos que su cita en BBVA ha sido agendada exitosamente con los siguientes detalles:</p>
                <div class="details">
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p><strong>Hora:</strong> ${hora}</p>
                    <p><strong>Agencia:</strong> ${agenciaNombre}</p>
                    <p><strong>Dirección:</strong> ${agenciaDireccion}</p>
                </div>
                <p>Por favor, llegue unos minutos antes de su cita. Si necesita cancelar o reprogramar, contáctenos con anticipación.</p>
                <p>Adjunto a este correo encontrará un PDF con el resumen de su cita para su referencia.</p>
                <p style="text-align: center;">
                    <a href="${pdfUrl}" class="button">Descargar Detalles de la Cita (PDF)</a>
                </p>
                <p>Agradecemos su confianza en BBVA.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} BBVA. Todos los derechos reservados.</p>
                <p>Este es un correo electrónico automático, por favor no responda a este mensaje.</p>
            </div>
            <div class="disclaimer">
                (Nota: La descarga del PDF es simulada en esta demostración. En una aplicación real, se generaría un PDF dinámicamente y se adjuntaría o se proporcionaría un enlace seguro para su descarga.)
            </div>
        </div>
    </body>
    </html>
  `
}

export function generateAppointmentPdfUrl(appointmentId: string): string {
  // In a real application, this would be a URL to a server endpoint
  // that generates and serves the PDF based on the appointmentId.
  // For this simulation, we'll use a placeholder.
  return `/placeholder.svg?height=800&width=600&text=Cita_BBVA_${appointmentId}.pdf`
}
