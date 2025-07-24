class EmailService {
  constructor() {}

  async sendPropertyNotification(property) {
    const subject = `🏠 New Property Alert: ${property.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📢 New Property Alert!</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Found on ${property.source}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">${property.title}</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 10px 0;"><strong>💰 Price:</strong> ${property.price}</p>
            <p style="margin: 0 0 10px 0;"><strong>📍 Location:</strong> ${property.location}</p>
            ${property.description ? `<p style="margin: 0 0 10px 0;"><strong>📝 Description:</strong> ${property.description}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${property.link}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🔗 View Property
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-top: 15px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⚡ This is a new listing just detected. Act fast!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
          
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            Detected at: ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })} (Amsterdam time)<br>
            Rental Property Scanner for Eindhoven
          </p>
        </div>
      </div>
    `;

    const textContent = `
🏠 New Property Alert: ${property.title}

Found on: ${property.source}
💰 Price: ${property.price}
📍 Location: ${property.location}
${property.description ? `📝 Description: ${property.description}` : ''}

🔗 Link: ${property.link}

⚡ This is a new listing just detected. Act fast!

Detected at: ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })} (Amsterdam time)
    `;


  }


}

module.exports = EmailService;
