import { useState, useRef, useEffect } from "react";

// ─── TRAINING DATA (32 real Veera messages) ─────────────────────────────────
const trainingData = [{"name": "Samir Soman", "job_title": "Sr./Systems Engineer", "seniority": "IC-Senior", "company": "AutoZone", "industry": "Automotive Retail", "region": "USA", "pain_primary": "Inventory event streaming, Order pipeline reliability, Traffic spikes, B2B transaction reliability", "messages": [{"stage": "After connection", "text": "Greetings Samir. Pleasure connecting with you. How are you?"}, {"stage": "Follow Up", "text": "Given your role as Cloud Architect-SRE & Platform Engineering Lead, DevOps at AutoZone, we believe Condense could support your platform initiatives by simplifying real-time streaming, reducing operational overhead around Kafka/streaming infrastructure, improving observability, and enabling more scalable, reliable data pipelines across cloud environments."}, {"stage": "Follow Up", "text": "We would appreciate 30 minutes at your convenience for a quick virtual discussion to understand your current architecture and explore potential areas of alignment along with your email id to share the detailed email. Need your support to take things forward. Thanks."}]}, {"name": "Pranjal Singh", "job_title": "Sr./Systems Engineer", "seniority": "IC-Senior", "company": "AutoZone", "industry": "Automotive Retail", "region": "India", "pain_primary": "Inventory event streaming, Order pipeline reliability, Traffic spikes, B2B transaction reliability", "messages": [{"stage": "First Message", "text": "Reached out to connect with you to have a 30mins of your slot during next week to position our platform Condense to AutoZone. Can I have your email id to send an tailored email and use cases. Thanks"}, {"stage": "Follow Up", "text": "I came across your profile while looking at teams building large-scale data platforms on GCP at AutoZone.\n\nAt Condense, we help data engineering teams ingest high-throughput streaming data, standardise pipelines, and operate reliably at scale—especially where Kafka, real-time telemetry, and cloud-native architectures are involved.\n\nWould love to exchange notes on how you’re handling ingestion, schema evolution, and scaling on GCP."}, {"stage": "Follow Up", "text": "Can we connect next week on your availability for 30mins please?"}]}, {"name": "Shankar N", "job_title": "Senior Vice President- Customer Success", "seniority": "VP", "company": "UB Technology Innovations (UBTI)", "industry": "Software Solutions", "region": "USA", "pain_primary": "Complex data integration Multi-client reliability", "messages": [{"stage": "First Message", "text": "Hi Shankar. How are you?\n\nNeed your email id and if possible 30 mins of your available slots during next week to discuss.\n\n\nI will share a detailed email once I have your email. Thanks"}, {"stage": "Follow Up", "text": "Condense and UBTI can together deliver end-to-end digital transformation by combining a real-time data backbone with solution and application expertise. Condense ingests and streams high-volume data from IoT devices, OT systems, machines, and enterprise platforms, enabling real-time analytics, predictive maintenance, fleet intelligence, and AI-driven optimization."}, {"stage": "Follow Up", "text": "Could we schedule 30 minutes next week to discuss and decide on the appropriate next steps, including whether to proceed further?"}]}, {"name": "Nivedita .", "job_title": "Embedded Software Engineer - Flight Computer", "seniority": "Engineer", "company": "Sarla Aviation", "industry": "Aviation", "region": "India", "pain_primary": "Real-time telemetry streaming reliability, Continuous flight data must be transmitted without loss or delay, Sensor data (altitude, speed, battery health, navigation) must remain accurate, Any streaming failure can impact safety and operational trust, Flight data scalability, As fleet size increases, telemetry volume grows exponentially, Backend systems must handle higher throughput without performance degradation, Scaling from prototype → commercial operations requires robust architecture, High availability for safety-critical systems, Aviation systems cannot tolerate downtime, Backend services supporting monitoring, alerts, and control must maintain near 100% uptime, Failover and redundancy are mandatory for mission-critical operations, Cost control during R&D scaling, High burn rate due to hardware + testing, Infrastructure costs must be optimized while iterating prototypes, Need efficient scaling without overprovisioning expensive cloud resources.", "messages": [{"stage": "First Message", "text": "I’ve been following Sarla Aviation’s work on eVTOL platforms—really exciting to see deep embedded and electric propulsion innovation coming out of Bangalore.\nI work with Zeliot Condense, where we focus on turning high-frequency embedded telemetry (sensors, BMS, motors, flight/vehicle controllers) into real-time diagnostics and lifecycle insights.\nWould love to exchange notes on how you’re thinking about data pipelines, reliability, and system observability in electric aviation platforms."}, {"stage": "Follow Up", "text": "Would you be open to a 30-minute virtual conversation to exchange perspectives on embedded software and data challenges in electric aviation platforms?\nIf this is better handled by another team, I’d appreciate it if you could point me to the right contact."}, {"stage": "Follow Up", "text": "I have sent an detailed email with relevant use cases to nivedita@sarla-aviation.com from veera.raghavan@zeliot.in. Looking forward to hearing from you and Wishing you a Happy New Year in advance. Thanks."}]}, {"name": "Sombabu Gunithi", "job_title": "AVP (Digital Group Head)", "seniority": "AVP", "company": "MosChip", "industry": "Semiconductor & Embedded Systems", "region": "India", "pain_primary": "Large-scale engineering data processing. Hardware-software integration complexity. High-performance compute scalability. Cost control for simulation workloads.", "messages": [{"stage": "First Message", "text": "Greetings Mr. Sombabu. How are you?"}, {"stage": "Follow Up", "text": "Earlier we connected over a call to have your appointment for a virtual meeting? Can we connect during next week based on your availability"}, {"stage": "Follow Up", "text": "Condense helps unify high-velocity IoT and mobility data across devices, OEMs, and protocols, making it reliable and low-latency for GenAI, digital twins, and agentic workflows—without changing existing models or applications.\n\nWould love to exchange notes on how you’re thinking about real-time data foundations for GenAI-driven digital transformation.\n\nCan we connect during next week based on your availability?"}]}, {"name": "Balaji Pawar", "job_title": "EVB - Electrical Engineer", "seniority": "Engineer", "company": "Octillion Power Systems", "industry": "EV Battery Manufacturing", "region": "USA", "pain_primary": "Real-time battery telemetry reliability. Manufacturing data processing at scale. High availability for safety-critical monitoring. Cost-efficient scaling of EV data infrastructure", "messages": [{"stage": "First Message", "text": "Hope you’re doing well Balaji. I want to introduce Zeliot Condense-backed by BOSCH India and how it can help Octillion Power Systems streamline real-time battery and system data, improve operational visibility, and reduce engineering overhead. I’d really appreciate a few minutes to walk you through the potential value for your teams and get your perspective—please let me know a convenient time. Thank you!"}, {"stage": "Follow Up", "text": "If u can share your email id, I will send a detailed email with relevant use cases. Regards and Have a great evening."}]}, {"name": "Darius Marcu", "job_title": "Head of Sales", "seniority": "Department Head", "company": "CANGO Mobility", "industry": "Electric Mobility / EV Fleet Operations", "region": "Hong Kong", "pain_primary": "Real-time fleet telemetry reliability Scalable event processing for fleet growth. High availability for operational continuity. Cost-efficient scaling of mobility data infrastructure.", "messages": [{"stage": "First Message", "text": "Hi Darius.\nHow are you?"}, {"stage": "Follow Up", "text": "Hope u remember me? We met during GITEX in Dubai. \nI’m doing good. Thanks for asking"}, {"stage": "Follow Up", "text": "Can we connect virtually next week based on your availability to discuss on few cases IoT and customised real time data streaming solutions that we can discuss."}, {"stage": "Follow Up", "text": "Yes.\nWe can also explore partner synergies"}, {"stage": "Follow Up", "text": "Let me know few available slots for next calendar. We can go on a call and see possible synergies"}, {"stage": "Follow Up", "text": "Condense already supports ingestion of vehicle and CANBus data from diverse sources. That said, we are open to exploring partnerships where there is clear value in faster onboarding, data quality, or extended use cases. Let’s discuss how CANGO Mobility could fit in."}, {"stage": "Follow Up", "text": "Ok invite sent."}]}, {"name": "Akshay Patil", "job_title": "Partner Growth Lead", "seniority": "Partner", "company": "Rockwell Automation", "industry": "Industrial Automation", "region": "USA", "pain_primary": "High-volume real-time industrial telemetry High availability for mission-critical systems Edge-to-cloud data integration complexity Scalable and secure global data infrastructure", "messages": [{"stage": "First Message", "text": "Hi Akshay\nHow are you?"}, {"stage": "Follow Up", "text": "Hi Akshay\nI’m with Zeliot, a Bosch-backed deep-tech company building a real-time data backbone for industrial and manufacturing platforms.\nOur platform Condense complements OT/IT ecosystems by enabling real-time data ingestion, event streaming, and analytics across plant systems, MES, and enterprise platforms. We see strong partner synergy with Rockwell Automation around smart manufacturing, connected operations, and Industry 4.0 use cases.\n\nWould be great to explore potential partnership and enablement opportunities. Happy to connect for a quick discussion if relevant."}]}, {"name": "Raj Kyadiggeri", "job_title": "Global Director, IT", "seniority": "Global Director", "company": "WD", "industry": "Data Storage & Semiconductor", "region": "USA", "pain_primary": "High-throughput data performance at scale Ultra-high reliability and data integrity Hardware-software integration complexity Scalable global data infrastructure", "messages": [{"stage": "First Message", "text": "Greetings Raj. Pleasure connecting with you."}, {"stage": "Follow Up", "text": "Sir. Wanted to briefly introduce Zeliot, a Bosch-backed deep-tech company. Our platform Condense provides a unified real-time data backbone that helps enterprises like Western Digital correlate signals across applications, infrastructure, endpoints, IAM, and ITSM to enable observability, AIOps, and proactive operations.\n\nI have also sent an detailed email in the morning. Would you be open to a 30-min conversation to walk through how Zeliot Condense helps enterprises like Western Digital unify real-time signals across apps, infra, endpoints, and ITSM for observability and AIOps?"}]}, {"name": "Khushbu Sharma", "job_title": "Sales Process and Enablement Activation", "seniority": "Manager", "company": "Rockwell Automation", "industry": "Industrial Automation", "region": "USA", "pain_primary": "High-volume real-time industrial telemetry High availability for mission-critical systems Edge-to-cloud data integration complexity Scalable and secure global data infrastructure", "messages": [{"stage": "First Message", "text": "Hi Khushbu. \nPleasure connecting with you.\nHow are you?"}, {"stage": "Follow Up", "text": "I’m with Zeliot, a Bosch-backed deep-tech company building a real-time data backbone for industrial and manufacturing platforms.\n\nOur platform Condense complements OT/IT ecosystems by enabling real-time data ingestion, event streaming, and analytics across plant systems, MES, and enterprise platforms. We see strong partner synergy with Rockwell Automation around smart manufacturing, connected operations, and Industry 4.0 use cases.\n\nWould be great to explore potential partnership and enablement opportunities. Happy to connect for a quick discussion if relevant."}]}, {"name": "Ranjit Abhyankar", "job_title": "Head-Advanved Technology Centre", "seniority": "Head", "company": "Indication Instruments Limited", "industry": "Automotive Electronics Manufacturing", "region": "India", "pain_primary": "Real-time vehicle telemetry processing Hardware-software integration complexity. Automotive-grade reliability requirements. Scaling for EV data demands", "messages": [{"stage": "First Message", "text": "Hi Sir. Pleasure connecting with you. Hope you are doing well."}, {"stage": "Follow Up", "text": "I’m reaching out from Zeliot, a Bosch-backed deep-tech company building real-time data infrastructure for industrial systems. Our platform, Condense, helps simplify real-time data ingestion and standardization across machines, sensors, and enterprise systems.\n\nWe commonly support use cases like creating a unified real-time data layer for industrial equipment to enable faster analytics, predictive maintenance, and system integration.\n\nWould like to connect with you for a brief conversation to explore if this could be relevant for Indication Instruments?"}]}, {"name": "Bhavesh Panchal", "job_title": "Chief Technology Officer", "seniority": "CTO", "company": "Magenta Mobility", "industry": "EV Mobility", "region": "India", "pain_primary": "Real-time fleet and battery telemetry reliability. Scalable event processing for fleet growth.High availability for operational continuity Cost-efficient scaling of mobility data infrastructure", "messages": [{"stage": "First Message", "text": "Real-Time Data Platform for EV & Mobility Innovation for Magenta Mobility\nHi Bhavesh,\nHope you are doing well. I’m reaching out from Zeliot, a Bosch-backed deep-tech company building real-time data infrastructure for large-scale mobility platforms. Our platform, Condense, helps standardize and stream real-time data across EVs, charging infra, and enterprise systems—strengthening the data foundation without disrupting existing applications.\n\nWe commonly support use cases like enabling event-driven architectures for fleet operations, real-time analytics, and faster innovation across mobility platforms.\n\nWould you be open to a brief conversation to explore potential alignment with Magenta Mobility’s technology roadmap?\n\nBest regards,\nVeera Raghavan"}]}, {"name": "Sandeep Ingle", "job_title": "Manager - IT Security & data protection", "seniority": "Manager", "company": "DHL Express India", "industry": "Logistics & Express Delivery", "region": "India", "pain_primary": "High-volume real-time shipment event streaming. High availability for mission-critical tracking systems. Scalable infrastructure during peak traffic spikes. Complex multi-system data integration", "messages": [{"stage": "First Message", "text": "I’m reaching out from Zeliot, a Bosch-backed deep-tech company building real-time data infrastructure for large-scale logistics and enterprise systems. Our platform, Condense, runs entirely within the customer’s cloud (BYOC), ensuring full data ownership, security, and compliance.\n\nWe support use cases like securely ingesting and standardizing real-time data across distributed systems while enforcing governance and access controls—without moving or duplicating sensitive data. Condense is already trusted in production by leading automotive and mobility organizations, including TVS Motor, Eicher Motors, SML Isuzu, Tata Motors Limited, Ashok Leyland, and Royal Enfield—supporting real-time vehicle data, manufacturing visibility, and digital platform initiatives at scale.\n\nWould like to have a brief conversation to explore if this could be relevant for DHL Express India?"}]}, {"name": "Pravin SSingh", "job_title": "Assistant General Manager", "seniority": "Senior Management", "company": "Bharatcell", "industry": "Lithium Battery Manufacturer", "region": "India", "pain_primary": "High-volume manufacturing data processing Quality control and production traceability Safety-critical monitoring reliability Cost-efficient scaling of production systems", "messages": [{"stage": "First Message", "text": "GM Pravin\nHow are you?\nAs you lead R&D across EV powertrain, battery systems, BMS, chargers, and ESS/BESS—along with vehicle homologation and AIS-156 compliance—Condense backed by BOSCH helps EV organizations ingest, standardize, and analyze high-frequency vehicle and battery data using low-latency APIs, enabling faster validation, compliance reporting, diagnostics, and scalable analytics without heavy data engineering. I’d love to schedule a quick 30-minute conversation to explore how Condense could support Zypp Electric’s R&D and compliance roadmap. Would sometime next week work for you?"}, {"stage": "Follow Up", "text": "Is that okay to share detailed email to you on pravin.singh@zypp.app and discuss on next steps?"}, {"stage": "Follow Up", "text": "Good morning. The email has been sent.\nWould appreciate 30 minutes sometime next week, based on your availability, to discuss further.\nHave a great day."}]}, {"name": "Sunil Ranganath", "job_title": "Lead Cyber Security Architect", "seniority": "Lead", "company": "Airbus", "industry": "Aviation and Aerospace Component Manufacturing", "region": "USA", "pain_primary": "Safety-critical real-time telemetry processing, Ultra-high availability and reliability requirements, Complex global manufacturing data integration, Secure and compliant data infrastructure", "messages": [{"stage": "First Message", "text": "Hi Sunil, appreciate the connection. Looking forward to exchanging insights.\nI came across your profile and your work as Lead Security Architect at Airbus. I’m working on Condense, an all-in-one real-time data streaming platform that helps security teams ingest, process, and act on security telemetry in real time.\n\nCondense simplifies streaming data from logs, SIEM, cloud, and OT/IT systems to enable faster threat detection, real-time anomaly monitoring, and unified security observability without complex infrastructure.\n\nWould love to connect and exchange thoughts around real-time security analytics and streaming architectures. Can we connect next week for a quick 30 mins discussion?"}, {"stage": "Follow Up", "text": "Sure. Thanks for the update. I will reach out to you during first week of Feb"}, {"stage": "Follow Up", "text": "Hi Sunil. Greetings. As per our last discussion, can we connect on 5th Feb or on 9th or 11th based on your availability for a quick 30 mins? If we can meet your team, we can walk-down to your office in Bangalore. Looking forward to hearing from you. Thanks"}, {"stage": "Follow Up", "text": "Hi Sunil, Greetings.\n\nGM. As discussed earlier, I wanted to check if we could connect for a quick 30-minute discussion on 5th Feb, or alternatively on 9th or 11th, based on your availability.\n\nIf convenient, we’d be happy to meet along with your team and can walk down to your office in Bangalore.\n\nLooking forward to hearing from you.\n\nThanks,\nVeera Raghavan"}]}, {"name": "Rajneesh Kushwaha Singh", "job_title": "Vice President IT & SAP", "seniority": "VP", "company": "Rays Power Infra Limited", "industry": "Services for Renewable Energy", "region": "India", "pain_primary": "Real-time solar plant performance monitoring, Grid integration and energy data synchronization, High availability of power generation systems, Scalable infrastructure for distributed renewable assets", "messages": [{"stage": "First Message", "text": "Hi Rajneesh. Hope you are doing well.!"}, {"stage": "Follow Up", "text": "Hi Rajneesh,\n\nHope you’re doing well. I’ve been following the journey of Hop Electric and the work you’re doing in the EV two-wheeler space—impressive progress.\n\nAt Zeliot, we’ve built Condense, a Bosch-backed real-time data engineering platform purpose-built for mobility and EV ecosystems. We help EV companies convert raw vehicle, battery, and charging telemetry into reliable, production-grade data streams—without replacing existing platforms or in-house IP.\n\nGiven your focus on scaling EV operations and digital platforms, I’d love to take 20 minutes to understand Hop Electric’s priorities around connected vehicles and data-driven decision-making, and explore if there’s any relevance for Condense in your roadmap.\n\nWould you be open to a short conversation?"}]}, {"name": "Mohammed Noor", "job_title": "Business Head", "seniority": "Head", "company": "Yatis Telematics Pvt. Ltd.", "industry": "Motor Vehicle Manufacturing", "region": "India", "pain_primary": "Real-time vehicle telemetry data reliability, Scalable processing of high-volume fleet tracking events, High availability of mission-critical fleet management systems, Cost-efficient scaling of telematics data infrastructure", "messages": [{"stage": "First Message", "text": "Hi Noor,\n\nThanks for accepting my request. Came across your profile—great to see your journey across Fleetx, Mahindra HSUV, and now building at Yatis.io. Given your focus on IoT, SaaS, and future mobility, thought this might be relevant.\n\nAt Zeliot, we’ve built Condense, a Bosch-backed real-time data engineering platform for mobility and EV ecosystems. We work with teams to simplify the backend engineering of connected data—ingestion, streaming, governance, and scale—so product and business teams can focus on outcomes rather than data plumbing.\n\nWould love to take 20–30 minutes to understand what you’re building at Yatis.io and exchange notes on real-time data, EV/IoT platforms, and process maturity across mobility stacks.\n\nLet me know if you’d be open to a quick conversation."}]}, {"name": "Vinayak Bhavnani", "job_title": "Co-Founder & CTO", "seniority": "CTO", "company": "Chalo", "industry": "Motor Vehicle Manufacturing", "region": "India", "pain_primary": "Real-time bus tracking and passenger information reliability, High-volume transit event data processing at scale, High availability of ticketing and fleet management systems, Cost-efficient infrastructure scaling across multiple cities", "messages": [{"stage": "First Message", "text": "Greetings Vinayak. How are you?"}, {"stage": "Follow Up", "text": "Would love to connect and explore a quick conversation around real-time data platforms for mobility at scale.\nCondense helps enterprises process high-frequency operational data in real time without complex streaming infrastructure.\nWould be great to get 20–30 minutes to share how we’re helping mobility platforms build scalable real-time data foundations."}]}, {"name": "VINOD K. SHARMA", "job_title": "Vice President, APAC, MEA", "seniority": "VP", "company": "MosChip", "industry": "Semiconductor & Embedded Systems", "region": "India", "pain_primary": "Large-scale engineering data processing. Hardware-software integration complexity. High-performance compute scalability. Cost control for simulation workloads.", "messages": [{"stage": "First Message", "text": "GM Vinod Sir. Hope you are doing well.\nAs you focus on R&D, embedded services, emerging technologies, and digital manufacturing initiatives, Condense helps engineering organizations ingest, standardize, and analyze high-volume device, sensor, and system data using low-latency APIs—enabling faster product validation, digitalization, and scalable data pipelines without heavy data engineering. I’d love to schedule a quick 30-minute conversation to explore how Condense could support MosChip’s R&D and digital transformation roadmap. Would sometime next week work for you?"}]}, {"name": "Bapun Kumar Pradhan", "job_title": "Product Development Engineer", "seniority": "Engineer", "company": "Routematic", "industry": "Transportation, Logistics, Supply Chain and Storage", "region": "India", "pain_primary": "Real-time employee transport tracking and route optimization reliability, Scalable processing of high-volume trip and GPS event data, High availability of scheduling and fleet management systems, Cost-efficient scaling of mobility operations infrastructure", "messages": [{"stage": "First Message", "text": "Hi Bapun,\n\nGood Morning! I’m Veera, leading Enterprise Business for India at Zeliot–Condense (Bosch-backed). Our platform, Condense, simplifies Kafka and real-time data streaming with BYOC flexibility, governance, and an IoT/edge-first design.\n\nFor a mobility platform like Routematic, Condense can enable real-time trip data streaming, fleet telemetry, and route optimization analytics — helping improve reliability, efficiency, and overall commuter experience.\n\nWould you be open for a quick face to face meeting during next week to explore how we could support your product roadmap at Routematic?\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n935-309-4136"}, {"stage": "Follow Up", "text": "GM Bapun,\nCondense backed by BOSCH helps mobility platforms ingest, standardize, and analyze vehicle and trip data at scale using low-latency APIs—enabling better fleet visibility, compliance, and operational intelligence without heavy data engineering. I’d love to schedule a quick 30-minute conversation to explore how Condense could align with Routematic’s platform and growth roadmap. Would sometime next week work for you?"}]}, {"name": "Venkatesh Gurumurthy", "job_title": "Chief Technology Officer", "seniority": "CTO", "company": "KEKA HR", "industry": "Software Development Human Resources Management Systems (HRMS)", "region": "USA", "pain_primary": "High availability of payroll and core HR systems, Secure handling of sensitive employee and payroll data, Scalable infrastructure to support growing enterprise customers, Performance reliability during peak payroll processing cycles", "messages": [{"stage": "First Message", "text": "Hi Venkatesh Sir,\nI’m with Zeliot-Condense (Bosch-backed) driving APAC business. We help cloud-native platforms like Keka HR with real-time infra monitoring, cost optimisation, and faster analytics. Would love to share how this could support your scalability and customer experience goals. Looking forward to hearing from you.\nRegards,\nVeera"}, {"stage": "Follow Up", "text": "Hi Sir. GM.\nCondense helps SaaS platforms ingest, standardize, and analyze data at scale using low-latency APIs—making it easier to build reliable analytics, integrations, and intelligent workflows without heavy data engineering. I’d love to schedule a quick 30-minute conversation to explore how Condense could support Keka’s data and platform roadmap. Would sometime next week work for you?"}]}, {"name": "Ajay Kumar", "job_title": "Chief Information Officer", "seniority": "CIO", "company": "Zero Motorcycles Inc.", "industry": "Electric Vehicle Manufacturing (Electric Motorcycles)", "region": "USA", "pain_primary": "Real-time vehicle and battery telemetry reliability, High availability of connected vehicle and monitoring systems, Scalable data infrastructure for growing EV fleets, Cost-efficient management of R&D and production data systems", "messages": [{"stage": "First Message", "text": "Ajay Sir. Good Morning. I’m reaching out to explore a potential collaboration between Zero Motorcycles and Zeliot, leveraging our Condense platform — a real-time data infrastructure built for connected vehicle ecosystems.\n\nCondense enables OEMs and EV manufacturers to seamlessly ingest, process, and analyze vehicle data at scale — helping improve diagnostics, compliance, and customer experience through standardized APIs and low-latency analytics.\n\nI’d love to schedule a short 30-minute discussion to walk you through how Condense could align with Zero Motorcycles’ connected tech roadmap.\nWould next week work for you?\n\nLooking forward to your response.\n\nRegards,\nVeera"}, {"stage": "Follow Up", "text": "Condense-backed by BOSCH helps OEMs and EV manufacturers ingest, standardize, and analyze vehicle data at scale using low-latency, standardized APIs to improve diagnostics, compliance, and customer experience. I’d love to schedule a quick 30-minute discussion to explore how Condense could align with Zero Motorcycles’ connected technology roadmap—would next week work for you?\nAlternatively, if you’re attending Geotab Connect 2026, happening February 10–12 at the MGM Grand in Las Vegas, we could catch up there as well.\nLooking forward to hearing from you. Have a great day."}]}, {"name": "Tushar Bhagat", "job_title": "Group CEO", "seniority": "CEO", "company": "Uffizio", "industry": "Software Development", "region": "India", "pain_primary": "Reliable real-time GPS and vehicle telemetry processing, Scalable handling of high-volume tracking and event data, High availability of mission-critical fleet management platforms, Cost-efficient infrastructure scaling for growing customer base", "messages": [{"stage": "First Message", "text": "Hi Sir,\nGreat connecting with you virtually on 9th Jan along with the Bosch team—really enjoyed the discussion and learning more about your platform roadmap. I have sent an email along the deck on Condense, Zeliot’s Bosch-backed, AI-first real-time data streaming platform, already powering large-scale mobility and telematics use cases across OEMs.\nWe see strong alignment around Uffizio–Condense synergies (telematics ingestion, real-time transforms for domain algorithms) and proven OTA & high-frequency streaming at OEM scale.\nHappy to set up a short virtual demo with your technical team to walk through the architecture and relevant use cases when convenient.\nRegards,\nVeera"}]}, {"name": "Prasad Rayala", "job_title": "Technical Management Specialist - Digital Twin", "seniority": "Specialist", "company": "Saipem", "industry": "Energy Engineering, Procurement & Construction (EPC) / Oil & Gas Infrastructure", "region": "UAE", "pain_primary": "Real-time monitoring of offshore and onshore energy operations, High availability of mission-critical project and operational systems, Complex integration of engineering and field data across global sites, Secure and compliant data management in regulated energy environments", "messages": [{"stage": "First Message", "text": "Hope you’re doing well Prasad. I wanted to introduce Zeliot Condense, backed by Bosch India, and how it can strengthen SAIPEM’s Digital Twin and information management initiatives by streaming and unifying real-time asset, engineering, and operational data—enabling faster model updates, improved visibility, and reduced data engineering effort. I’d really appreciate a few minutes to walk you through the potential value and get your perspective. Please let me know a convenient time. Thank you!"}, {"stage": "Follow Up", "text": "Monday 4 to 4:30 IST works for you?"}, {"stage": "Follow Up", "text": "Hi Prasad. GM. \nCan we connect on 22nd at 1:30PM IST? Please confirm. Thanks and Have a great day."}, {"stage": "Follow Up", "text": "Okay. Sending invite now. Thanks"}]}, {"name": "Richa Sachdeva", "job_title": "Senior Engineering Manager", "seniority": "Senior Manager", "company": "MakeMyTrip", "industry": "Online Travel & Hospitality Technology (OTA – Online Travel Agency)", "region": "India", "pain_primary": "High availability of booking and payment systems during peak travel demand, Real-time processing of search, pricing, and inventory data, Scalability to handle seasonal traffic spikes and flash sales, Secure handling of customer data and transaction compliance", "messages": [{"stage": "First Message", "text": "Hope you’re doing well Richa. Zeliot (Bosch-backed). We build Condense, a BYOC real-time data platform that helps engineering teams power low-latency, scalable systems for AI-driven product experiences.\nWe often work on use cases like real-time personalization and pricing signals, live experimentation and feature pipelines for GenAI, streaming user and supply signals for faster decisioning, and simplifying event-driven architectures at scale.\nWould be great to connect virtually and exchange notes on how real-time data is shaping product growth and AI initiatives at MakeMyTrip.\nLooking forward to hearing from you. Have a great day.!"}, {"stage": "Follow Up", "text": "GM Richa. We commonly work on real-time personalization, GenAI feature pipelines, and event-driven architectures at scale. Would be great to connect and exchange notes on how real-time data is shaping product systems at MakeMyTrip. I have sent an detailed email just now. Thanks"}]}, {"name": "Channaveer .B.Biradar", "job_title": "AVP Head Digital Strategy and Governance (Digital Transformation)", "seniority": "AVP", "company": "Syngene International Limited", "industry": "Pharmaceutical Manufacturing", "region": "India", "pain_primary": "High-integrity processing of large-scale research and laboratory data, Secure and compliant data management under strict regulatory frameworks, Integration of experimental, clinical, and manufacturing data systems, High availability of research and production infrastructure systems", "messages": [{"stage": "First Message", "text": "Hi Sir, \nI had shared an email on Monday introducing Zeliot Condense, a Bosch-backed real-time data platform and deep tech company for high-throughput, mission-critical environments.\n\nGiven your role in Digital IT & Transformation at Syngene, I believe Condense can enable a governed, real-time data backbone across lab systems, manufacturing, and enterprise analytics—supporting instrument integration, process monitoring, data governance, and AI-ready pipelines.\n\nWould be glad to connect briefly and explore alignment with your digital roadmap. Need your support to have a 30 mins discussion based on your availability."}]}, {"name": "Mehul Bhaktani", "job_title": "Business Development Manager - Advance Solutions & EDX", "seniority": "Manager", "company": "Yokogawa", "industry": "Industrial Automation & Process Control", "region": "Japan", "pain_primary": "Reliable real-time processing of industrial and plant telemetry data, High availability for mission-critical process control systems, Integration of distributed industrial systems across global sites, Secure and compliant data infrastructure in regulated environments", "messages": [{"stage": "First Message", "text": "Hope you’re doing well. Zeliot (Bosch-backed). We build Condense, a real-time data platform that helps companies like Yokogawa bridge OT, control systems, and AI/analytics using a BYOC, no lock-in approach.\nWe typically support Industry 4.0 initiatives by enabling low-latency data flow from plant systems into advanced analytics, AI, and digital twin use cases—without heavy custom integration.\nWould be great to connect and set up a short meeting to exchange notes on Yokogawa’s digital and IIoT initiatives and see where Condense could complement them.\nLooking forward to hearing from you.\nHave a great day.!"}, {"stage": "Follow Up", "text": "I have sent an introduction email to mehul.bhaktani@yokogawa.com. Please review. Thanks"}]}, {"name": "Upkar Singh", "job_title": "Head of Information Technology", "seniority": "Head", "company": "Paradeep Phosphates", "industry": "Chemical Manufacturing", "region": "India", "pain_primary": "Real-time monitoring of chemical production processes and plant telemetry, High availability of safety-critical manufacturing systems, Integration of production, supply chain, and distribution data, Regulatory compliance and secure handling of environmental data", "messages": [{"stage": "First Message", "text": "Hope you’re doing well. I work with Zeliot backed by BOSCH, supporting digital transformation teams in chemicals and process manufacturing to operationalize real-time data across plants and enterprise systems.\nWe commonly work on GFL-relevant use cases such as real-time process stability and anomaly detection in continuous operations, asset health and predictive maintenance for critical equipment, energy and utility optimization, and live yield/quality correlation across batches and campaigns.\nWould be great to connect and exchange notes on the digital initiatives you’re driving at Gujarat Fluorochemicals and where real-time data could accelerate impact\nLooking forward to connecting with you."}]}, {"name": "Aneesh Dinesh Diwakar", "job_title": "Manager, (R&D-Motor Design and Control)", "seniority": "Manager", "company": "Bajaj Auto Ltd", "industry": "Manufacturing", "region": "India", "pain_primary": "Real-time vehicle and production telemetry management, High availability of manufacturing and supply chain systems, Integration of connected vehicle, dealer, and aftersales data, Scalable and cost-efficient infrastructure for EV and digital initiatives", "messages": [{"stage": "First Message", "text": "Greetings Aneesh,\nHappy New Year...!\nNice to connect. I work with Zeliot-Condense, backed by Bosch, an AI-first real-time data streaming platform used for handling high-frequency vehicle, powertrain, and system-level telemetry in EV software and validation environments.\n\nWould love to catch up for a brief conversation to explore how real-time data platforms can support EV powertrain R&D and validation workflows at scale. \n\nLooking forward for your response.\n\nRegards,\nVeera"}, {"stage": "Follow Up", "text": "Hope you’re doing well Aneesh. I wanted to introduce Zeliot Condense, backed by Bosch India, and how it can support Bajaj Auto’s R&D by unifying real-time vehicle, battery, and test-bench data to accelerate development cycles, improve experiment visibility, and reduce data engineering effort. I’d really appreciate a few minutes to walk you through the potential value for your teams—please let me know a convenient time. Thank you!"}, {"stage": "Follow Up", "text": "Greetings Aneesh. Can we connect next week based on your availability. Looking forward to hearing from you. Have a great day.!"}]}, {"name": "BURLA SRINIVAS", "job_title": "Chief Manager-Powertrain (Production and R&D)", "seniority": "Chief Manager", "company": "PuREEnergy India", "industry": "Energy Tech", "region": "India", "pain_primary": "Real-time battery and vehicle telemetry reliability, High availability of connected vehicle and monitoring systems, Scalable infrastructure for growing EV fleet data, Cost-efficient management of R&D and production systems", "messages": [{"stage": "First Message", "text": "Hope you’re doing well Srinivas. I wanted to introduce Zeliot Condense, backed by Bosch India, and how it can support PURE EV’s R&D by consolidating real-time vehicle and battery data across testing and validation, accelerating development cycles, and reducing data engineering overhead. I’d really appreciate a few minutes to walk you through the potential value for your teams—please let me know a convenient time. Thank you!"}, {"stage": "Follow Up", "text": "Greetings Srinivas. Can we connect next week based on your availability. Looking forward to hearing from you. Have a great day.!"}]}, {"name": "varun singh", "job_title": "Head of Technology and Enterprise Architecture", "seniority": "Head", "company": "Emergys", "industry": "IT Services and IT Consulting", "region": "USA", "pain_primary": "Complex integration of enterprise systems across client environments, High availability of mission-critical ERP and cloud platforms, Managing large-scale data migration and transformation projects, Cost-efficient scaling of multi-client cloud and infrastructure services", "messages": [{"stage": "First Message", "text": "Hi Varun. Wish you a Happy New Year.!\n\nHope you’re doing well. I head the Enterprise Business for APAC & GCC region and wanted to introduce Zeliot Condense, backed by Bosch India, and how it can support Emergys’ enterprise architecture and AI/data initiatives by providing a secure, BYOC real-time data backbone—simplifying streaming architecture, strengthening governance, and enabling scalable AI and digital platforms. I’d appreciate a few minutes to walk you through the potential value and get your perspective. Please let me know a convenient time. Thank you!"}, {"stage": "Follow Up", "text": "Greetings Varun. Can we connect next week based on your availability. Looking forward to hearing from you. Have a great day.!"}]}, {"name": "Sandeep Bangia", "job_title": "Head - Business Transformation, Strategy & E-Mobility", "seniority": "Head", "company": "Gulf Oil India", "industry": "Oil and Gas", "region": "India", "pain_primary": "Real-time monitoring of manufacturing and blending operations, High availability of production and distribution systems, Integration of supply chain, dealer network, and sales data, Regulatory compliance and secure management of operational data", "messages": [{"stage": "First Message", "text": "Hi Sandeep Sir. Hope you’re doing well. I wanted to introduce Zeliot Condense, backed by Bosch India, and how it can support Gulf Oil India’s business transformation and e-mobility initiatives by unifying real-time data across EV assets, charging infrastructure, and digital platforms—enabling faster strategy execution, improved operational visibility, and reduced integration effort. I’d really appreciate a few minutes to walk you through the potential value and get your perspective. Please let me know a convenient time. Thank you!"}, {"stage": "Follow Up", "text": "Greetings Sir. Can we connect next week based on your availability. Looking forward to hearing from you. Have a great day.!"}]}, {"name": "Vishal Patil", "job_title": "Embedded Software Engineer", "seniority": "IC – Mid", "company": "iGoWise Mobility (iGo)", "industry": "Automotive / Motor Vehicle Manufacturing", "region": "India", "pain_primary": "Real-time device & vehicle data streaming", "messages": [{"stage": "First Message", "text": "Hi Vishal, Hope you’re doing well. I wanted to introduce Zeliot Condense, backed by Bosch India, and how it can help iGo’s embedded and firmware teams stream, validate, and consume real-time device and vehicle data—simplifying integration, improving debug visibility, and reducing backend data engineering effort. I’d really appreciate a few minutes to walk you through the potential value and get your perspective. Please let me know a convenient time. Thank you!"}]}, {"name": "A R Shrinivasan", "job_title": "Head – Information Technology", "seniority": "Head / Senior Leadership", "company": "SPIC Ltd & Greenstar Fertilizers Ltd", "industry": "Chemicals / Fertilizers / Manufacturing", "region": "India", "pain_primary": "Real-time device & vehicle data streaming", "messages": [{"stage": "First Message", "text": "Greetings Srinivasan Sir. Wishing you a very Happy New Year. May the year ahead bring success, good health, and exciting possibilities."}, {"stage": "Follow-up", "text": "Hope you’re doing well Sir. I wanted to introduce Zeliot Condense, backed by Bosch India, and how it can support SPIC’s digital transformation by enabling real-time data unification across plant operations, energy systems, and monitoring platforms—reducing integration complexity and accelerating insight-to-action. I’d really appreciate a few minutes to walk you through the potential value for your teams and get your perspective. Please let me know a convenient time. Thank you!"}]}, {"name": "Ashay Kothari", "job_title": "Global IT Leader / SAP S/4HANA Project Manager", "seniority": "Senior Leadership (IT Leader / Project Manager)", "company": "Tolaram", "industry": "Manufacturing / Logistics / Consumer & Industrial Business", "region": "Singapore", "pain_primary": "Real-time logistics data streaming", "messages": [{"stage": "First Message", "text": "Greetings Ashay, Great meeting you at GITEX. I also shared a follow-up email with more details on Zeliot Condense to ashay@tolaram.com on 2nd Jan on the requirement that you're looking in. Would be great to connect for a short conversation to explore how Condense can support real-time data streaming for logistics, TPMS, and fuel-sensor–driven platforms. Looking forward for your thoughts. Regards, Veera"}, {"stage": "Follow-up", "text": "GM Ashay. Can we connect next week virtually to have a detailed discussion? Have a great day.!"}, {"stage": "Follow-up", "text": "Hi Ashay. Can we connect next week virtually to have a detailed discussion? Have a great day.!"}]}, {"name": "Arjun Dhawan", "job_title": "Data Analyst", "seniority": "IC – Mid", "company": "Saera Electric", "industry": "Electric Vehicles / Automotive", "region": "India", "pain_primary": "Real-time logistics data streaming", "messages": [{"stage": "First Message", "text": "HI Arjun Wishing you a very Happy New Year. May the year ahead bring success, good health, and exciting possibilities."}, {"stage": "Follow-up", "text": "Hope you’re doing well Arjun. I wanted to introduce Zeliot Condense, backed by Bosch India, and how it can help Saera Electric streamline real-time vehicle and battery data, improve operational visibility, and reduce engineering overhead. I’d really appreciate a few minutes to walk you through the potential value for your teams and get your perspective—please let me know a convenient time. Thank you!"}]}, {"name": "Apoorva Mishra", "job_title": "Assistant Manager – Design & Development", "seniority": "Mid-Level Manager", "company": "Honda R&D", "industry": "Automotive OEM", "region": "India", "pain_primary": "Real-time ECU & vehicle data streaming", "messages": [{"stage": "First Message", "text": "Hi Apoorva, How are you? Thanks for accepting the invite. We had briefly connected earlier at the Bharat Mobility Expo in Feb. I head the Enterprise business for the APAC region at Zeliot Condense, a Bosch-backed real-time data streaming platform used in connected automotive systems. We help teams working on electronics and vehicle platforms stream, monitor, and analyze real-time data from ECUs, validation setups, and production environments—without heavy infrastructure overhead."}, {"stage": "Follow-up 1", "text": "I’d be happy to share a few relevant use cases in more detail—could you please let me know the best email ID to reach you? We had earlier tried reaching out on amishra1@hondacarindia.com and wanted to confirm if that’s still the right contact. Looking forward in hearing you. Happy New Year in advance. Thanks."}, {"stage": "Follow-up 2", "text": "Can we connect next Monday at 12pm for 30mins virtually to showcase a quick demo? Maybe u can add related team members. I’m confident it will be a productive session. As most of the OEM’s TVS, Volva, Montra, RE etc are already Condense. If the meeting aligns better, we can take it forward or can discontinue. Let me know. Accordingly will share an invite. Thanks."}, {"stage": "Follow-up 3", "text": "Good Morning. Any update from your team for a virtual discussion next week? Have a great day.!"}]}, {"name": "Kartikey Hariyani", "job_title": "Founder & CEO", "seniority": "C-Level (Founder / CEO)", "company": "CHARGE ZONE", "industry": "EV Charging Infrastructure", "region": "India", "pain_primary": "EV charging infrastructure monitoring & load balancing", "messages": [{"stage": "First Message", "text": "Hi Kartikey, Great to connect with you. I wanted to quickly introduce Zeliot (a Bosch-backed company) and our flagship platform Condense. It simplifies real-time data streaming and analytics, with strong relevance for EV charging ecosystems. For Chargezone, Condense can enable:⚡ Charging Infrastructure Monitoring – live visibility into station usage, load balancing, and uptime.\n🔋 Battery & Energy Analytics – predictive insights on energy demand and consumption patterns.\n🚘 Connected Fleet Enablement – real-time telemetry for EV fleets using your charging network.Would love to schedule a short discussion to explore how Condense can complement Chargezone’s growth and digital initiatives.Thanks & Regards,\nVeera Raghavan\nCountry Sales Manager-India Business\n📞 935-309-4136"}]}, {"name": "Venkatesh Rajagopalan Narayana", "job_title": "Digital Enterprise Architect / Applied AI & ML Expert", "seniority": "Senior Leadership", "company": "Shell", "industry": "Oil & Gas / Energy", "region": "London, England", "pain_primary": "Connected-asset intelligence & large-scale data ingestion", "messages": [{"stage": "First Message", "text": "Thanks for the note. At Zeliot, we work extensively on enabling connected-asset intelligence at scale through our Condense platform—covering device lifecycle, data ingestion, security, and analytics across multiple domains. There appears to be strong alignment with the service models you’re building across teams and GCCs. I’d welcome a conversation to identify areas where we could jointly drive scalable innovation."}, {"stage": "Follow-up", "text": "I will add both emails. Want to explore potential use cases in Shell too. Need your help to loop connects in Shell too. I have sent couple of emails to Shweta ma’am, poornima.girish@shell.com, and B Praveen."}]}, {"name": "Brijesh Shah", "job_title": "Project Digital Twin & AI Implementation Lead", "seniority": "Senior Professional / Lead", "company": "Saipem", "industry": "Oil & Gas Engineering / EPC", "region": "Milan, Lombardy", "pain_primary": "Enterprise digital platform integration", "messages": [{"stage": "First Message", "text": "Greetings Brijesh.\nWishing a prosperous New Year."}, {"stage": "Follow-up", "text": "I previously connected with Nirmal Kumar from the ICT, Chennai team, who suggested I reach out to the data and digital leadership. I’ve shared a brief introduction email from veera.raghavan@zeliot.in to brijesh.shah@saipem.com as well. Would be great to connect and briefly explore how Condense supports real-time data foundations for Digital Twin initiatives. Looking forward to hearing from you."}]}, {"name": "Mahesh Padmanabh", "job_title": "Head of Electrical Systems – EV (E/E)", "seniority": "Senior Leadership (Head of Department)", "company": "River", "industry": "Electric Vehicles", "region": "India", "pain_primary": "Real-time data foundation for Digital Twin initiatives", "messages": [{"stage": "First Message", "text": "Hi Mahesh,How are you?"}, {"stage": "Follow-up", "text": "I’ve shared a detailed note over email regarding enabling a real-time data backbone for EV E/E systems at River.Would be great to connect briefly and explore how Condense (Bosch-backed) can support high-frequency CAN/BMS streaming, VIN-level traceability, and OTA/DTC visibility for your programs.Looking forward to connecting for a quick 30-minute virtual discussion next week, based on your availability. Please let me know a suitable time, and I’ll be happy to align.Regards, Veera"}, {"stage": "Follow-up", "text": "Earlier we had a discussion with Rohit Naidu from River."}, {"stage": "Follow-up", "text": "Detailed email is sent to mahesh@rideriver.com from Veera.raghavan@zeliot.in. Please check. Thanks.Looking forward to hearing from you."}]}, {"name": "Sunil Chaudhari", "job_title": "VP – Domain Lead Observability COE / Site Reliability Engineer", "seniority": "VP / Senior Leadership", "company": "DBS Tech India", "industry": "Software / Cloud / Enterprise Platforms", "region": "India", "pain_primary": "High-frequency CAN/BMS real-time streaming", "messages": [{"stage": "First Message", "text": "Hi Sunil Sir. How are you?Pleasure connecting with you."}]}, {"name": "Bala Subramanian Ramalingam", "job_title": "Country Manager / Country Sales Manager", "seniority": "Mid-Senior / Leadership", "company": "FADU (fabless semiconductor)", "industry": "Semiconductor / Storage SSDs", "region": "India & Middle East", "pain_primary": "Equipment downtime and process deviations affecting yield", "messages": [{"stage": "Follow up", "text": "Use cases for FADU (semiconductor manufacturing) and how Zeliot–Condense can help:\n1. Real-Time Equipment & Process Monitoring\nUse Case: Semiconductor fabs have multiple tools (lithography, etching, deposition, testing) generating continuous telemetry. Any delay in detecting deviations can lead to defects or downtime.\nCondense Advantage:\nStreams high-volume sensor and equipment data in real time.\nEnables immediate alerts for anomalies or process deviations.\nProvides unified dashboards for cross-line visibility.\n2. Predictive Maintenance\nUse Case: Unexpected equipment failures lead to costly downtime and reduced wafer yield.\nCondense Advantage:\nFeeds real-time telemetry into predictive ML models.\nIdentifies potential failures before they occur.\nReduces unplanned downtime, extends equipment life, and improves throughput.\n3. Yield Optimization & Quality Analytics\nUse Case: Maximizing yield is critical in semiconductor production; minute variations can impact defect rates.\nCondense Advantage:\nAggregates sensor, process, and test data in a centralized platform.\nSupports predictive analytics to optimize process parameters.\nEnables root-cause analysis of defects in near real-time.\n4. Energy & Resource Optimization\nUse Case: Semiconductor fabs consume massive amounts of power, water, and gases. Efficient usage is critical to cost and sustainability targets.\nCondense Advantage:\nMonitors energy, water, and chemical usage across the fab.\nProvides real-time alerts for abnormal consumption.\nPredicts load balancing needs and reduces waste.\n5. Multi-Site Data Unification & Governance\nUse Case: Large semiconductor companies operate multiple fabs across locations; consolidating data is challenging.\nCondense Advantage:\nProvides a multi-cloud, scalable architecture for data aggregation.\nEnsures governance, compliance, and auditability of streaming data.\nAllows centralized control while keeping latency low for factory-floor decisions.\n6. IoT & Edge Computing for Factory Automation\nUse Case: Edge-level processing is needed for latency-sensitive manufacturing processes.\nCondense Advantage:\nSupports edge-first architecture, enabling immediate local insights.\nReduces latency for automated decision-making on the production line.\nIntegrates seamlessly with AI/ML models deployed at the edge.\nSummary of How Condense Helps FADU:\nOperational Efficiency: Immediate visibility into equipment and process metrics.\nCost Savings: Predictive maintenance and energy optimization reduce waste.\nQuality & Yield: Early detection of anomalies improves wafer yield.\nScalable Architecture: Multi-fab, multi-cloud, and edge-ready solution.\nData Governance: Ensures compliance and secure handling of sensitive manufacturing data.\n\nSir. Please share your email id to send a formal email. Thanks"}]}, {"name": "Chandra Gupta", "job_title": "Vice President", "seniority": "Vice President (Senior Leadership)", "company": "T-Mobile", "industry": "Telecommunications", "region": "United States", "pain_primary": "Managing and scaling real-time telemetry data for connected EV networks and fleet ecosystems.", "messages": [{"stage": "Initial Outreach", "text": "Hi Chandra Sir,\nI wanted to introduce our flagship platform Condense, which simplifies real-time data streaming and analytics for connected EV ecosystems.\nGiven T-Mobile’s role in providing connectivity services to EV network like VinFast and other EV sector players, I’d love to explore a potential partnership where Condense can:\nEnhance real-time telemetry and fleet monitoring for connected EVs.\nEnable predictive energy & battery analytics for charging networks.\nProvide scalable, multi-cloud streaming infrastructure to support T-Mobile’s connected EV services.\nI would greatly appreciate the opportunity to discuss how we can collaborate to strengthen EV's connected mobility ecosystem like VinFast’s.\nThanks & regards,\nVeera Raghavan\nCountry Sales Manager – India Business\n📞 935-309-4136"}]}, {"name": "Vikas Parihar", "job_title": "Global Automotive Supply Chain & Logistics Leader", "seniority": "Senior Leadership (Global Function Head level)", "company": "Ola Electric", "industry": "Electric Vehicles / Automotive", "region": "India (Global Role Scope)", "pain_primary": "Lack of unified real-time visibility across vehicle telemetry, charging networks, and distribution operations.", "messages": [{"stage": "Initial Outreach", "text": "Greetings Vikas,\n\nI’m Veera, leading Enterprise Business for India at Zeliot–Condense (Bosch-backed). Our flagship platform, Condense, helps enterprises simplify Kafka and real-time data streaming with BYOC flexibility, built-in governance, and an IoT/edge-first design.\n\nFor an EV pioneer like Ola Electric, Condense can enable real-time vehicle telemetry, charging network data streaming, and fleet performance analytics — driving operational efficiency, predictive insights, and enhanced customer experience.\n\nWould you be open for a virtual discussion next week, based on your availability, to explore potential synergies?\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n935-309-4136"}]}, {"name": "Mahadevan R", "job_title": "General Manager – Digital Transformation", "seniority": "Senior Management (General Manager Level)", "company": "Toyota Kirloskar Motor", "industry": "Automotive Manufacturing", "region": "Karnataka, India", "pain_primary": "Fragmented real-time data across connected vehicles, manufacturing plants, and enterprise systems.", "messages": [{"stage": "Initial Outreach", "text": "Greetings Mahadevan,\n\nI’m Veera, leading Enterprise Business for India at Zeliot–Condense (Bosch-backed). Our flagship platform, Condense, helps enterprises simplify Kafka and real-time data streaming with BYOC flexibility, built-in governance, and an IoT/edge-first design.\n\nFor an automotive pioneer like Toyota Kirloskar Motor, Condense can power real-time vehicle telemetry, connected factory data streaming, and fleet performance analytics — enabling smarter operations, predictive maintenance, and superior customer experience.\n\nWould you be open for a face-to-face discussion next week, based on your availability, to explore potential synergies?\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n935-309-4136"}]}, {"name": "Vaibhav Gupta", "job_title": "Head of Consumer Operations", "seniority": "Department Head (Senior Leadership)", "company": "ElectricPe", "industry": "EV Charging / Electric Mobility", "region": "India", "pain_primary": "Managing and scaling real-time charging network data, vehicle telemetry, and fleet operations across distributed EV infrastructure.", "messages": [{"stage": "Re-engagement", "text": "Greetings Vaibhav,\n\nHope you are doing well. I lead Enterprise Business for India at Zeliot–Condense (Bosch-backed). Our flagship platform, Condense, enables enterprises to simplify Kafka and real-time data streaming with BYOC flexibility, built-in governance, and an IoT/edge-first design.\n\nFor an innovative EV pioneer like ElectricPe, Condense can power real-time vehicle telemetry, charging network data streaming, and fleet performance analytics — enabling smarter operations, predictive maintenance, and superior customer experience.\n\nWould you be open to a face-to-face discussion next week, at your convenience, to explore potential synergies?\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n📞 935-309-4136"}]}, {"name": "Anita Sagar", "job_title": "Director", "seniority": "Director Level (Senior Leadership)", "company": "AspireAI", "industry": "Artificial Intelligence / Technology", "region": "India (based on connection context)", "pain_primary": "Managing large-scale real-time vehicle telemetry and charging network data pipelines.", "messages": [{"stage": "Initial Outreach", "text": "Hi Anita,\n\nHope you are doing well. It was a pleasure connecting. I lead Enterprise Business for India at Zeliot–Condense (Bosch-backed). Our flagship platform, Condense, enables enterprises to simplify Kafka and real-time data streaming with BYOC flexibility, built-in governance, and an IoT/edge-first design.\n\nFor an EV pioneer like Tesla, Condense can enable real-time vehicle telemetry, charging network data streaming, and fleet performance analytics — helping drive operational efficiency, predictive insights, and enhanced customer experience.\n\nIt would be great if you could share your official email so I can send across the details. Based on your availability, we can then fix a suitable time for a deeper discussion.\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n📞 935-309-4136"}]}, {"name": "Vijayasree Patnaik", "job_title": "Digital Transformation Leader", "seniority": "Senior Leadership", "company": "Force Motors", "industry": "Automotive / Manufacturing", "region": "India", "pain_primary": "Lack of unified real-time visibility across smart factories, IoT devices, and supply-chain systems.", "messages": [{"stage": "Initial Outreach", "text": "Greetings Vijayasree,\n\nHope you are doing well. I’m Veera from Zeliot–Condense (Bosch-backed), where I lead Enterprise Business for India. Our flagship platform, Condense, simplifies Kafka and real-time data streaming with BYOC flexibility, built-in governance, and an IoT/edge-first design.\n\nFor a manufacturing leader like Force Motors, Condense can power smart factory operations, connected supply-chain visibility, and IoT-driven predictive maintenance — enabling operational excellence, faster decision-making, and lower total cost of ownership.\n\nIt would be great if you could share your official email so I can send across more details. Based on your availability, we can align on a discussion around potential synergies.\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n📞 935-309-4136"}]}];

// ─── CLAUDE API (single turn) ─────────────────────────────────────────────────
// ─── GEMINI API (Claude-compatible wrapper) ───────────────────────────────────
// Converts Claude-format calls → Gemini REST API → Claude-compatible response.
// Google Search grounding replaces Claude web_search_20250305 tool.
async function callClaude({ system, messages, tools, max_tokens = 1500 }) {
  // Build Gemini contents array from Claude-style messages
  const contents = messages.map((msg) => {
    const role = msg.role === "assistant" ? "model" : "user";
    let parts;
    if (typeof msg.content === "string") {
      parts = [{ text: msg.content }];
    } else if (Array.isArray(msg.content)) {
      parts = msg.content
        .map((c) => {
          if (c.type === "text") return { text: c.text };
          if (c.type === "tool_result") return { text: String(c.content || "done") };
          return { text: JSON.stringify(c) };
        })
        .filter((p) => p.text);
    } else {
      parts = [{ text: String(msg.content || "") }];
    }
    return { role, parts: parts.length ? parts : [{ text: " " }] };
  });

  const body = {
    contents,
    // responseMimeType forces Gemini to return pure JSON with no markdown or annotations
    generationConfig: {
      maxOutputTokens: max_tokens,
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  };

  // System instruction
  if (system) {
    body.system_instruction = { parts: [{ text: system }] };
  }

  // Google Search grounding is intentionally disabled:
  // it wraps responses in citation annotations that break JSON parsing.

  // CRA proxy (package.json "proxy" field) forwards /api/* to localhost:3001
  const proxyUrl = "/api/gemini";

  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini proxy error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Gemini API error");

  // Convert Gemini response → Claude-compatible format
  // Gemini always returns grounded text directly (no multi-turn tool_use needed)
  const candidate = data.candidates?.[0];
  const text =
    candidate?.content?.parts?.map((p) => p.text || "").join("") || "";

  return {
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
  };
}

// ─── EXTRACT JSON from any text (robust) ─────────────────────────────────────
function extractJSON(text) {
  if (!text || !text.trim()) throw new Error("Empty response from Gemini");
  // Strip markdown fences and citation tags
  let s = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  // Find the outermost { ... } JSON object
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) {
    console.error("extractJSON failed — raw text:", s.slice(0, 300));
    throw new Error("No JSON object found in response. Check VS Code terminal for raw output.");
  }
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch (e) {
    console.error("JSON.parse failed:", e.message, "text:", s.slice(start, start + 300));
    throw new Error("JSON parse error: " + e.message);
  }
}

// ─── STRIP CITATION TAGS from research output ────────────────────────────────
function stripCites(text) {
  if (!text) return text;
  if (typeof text === "string") return text.replace(/<[^>]+>/g, "").trim();
  if (Array.isArray(text)) return text.map(stripCites);
  return text;
}

function cleanResearch(r) {
  if (!r) return r;
  return {
    ...r,
    company_overview: stripCites(r.company_overview),
    tech_stack_signals: stripCites(r.tech_stack_signals),
    pain_points: stripCites(r.pain_points),
    recent_news: stripCites(r.recent_news),
    why_condense_fits: stripCites(r.why_condense_fits),
    conversation_hooks: stripCites(r.conversation_hooks),
  };
}

// ─── LINKEDIN LOOKUP ──────────────────────────────────────────────────────────
async function lookupLinkedIn(linkedinUrl, onStatus) {
  onStatus("🔍 Looking up LinkedIn profile...");
  try {
    const res = await fetch("/api/linkedin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedinUrl }),
    });
    if (!res.ok) throw new Error("Lookup failed");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    onStatus("✅ Profile found!");
    return data;
  } catch (err) {
    throw new Error("Could not extract profile: " + err.message);
  }
}

// ─── RATE LIMIT HELPER ───────────────────────────────────────────────────────
async function rateLimitDelay(ms, onLog, msg) {
  if (onLog && msg) onLog(msg);
  await new Promise(r => setTimeout(r, ms));
}

// ─── AGENTIC LOOP with web search ─────────────────────────────────────────────
// Keeps running until stop_reason === "end_turn" and we have parseable JSON
async function runAgenticLoop({ system, initialUserMsg, tools, max_tokens = 4000, onLog }) {
  const webSearchTool = { type: "web_search_20250305", name: "web_search" };
  const allTools = tools || [webSearchTool];

  let messages = [{ role: "user", content: initialUserMsg }];
  let rounds = 0;
  const MAX_ROUNDS = 8;

  while (rounds < MAX_ROUNDS) {
    rounds++;
    const data = await callClaude({ system, messages, tools: allTools, max_tokens });

    // Append assistant response to conversation
    messages.push({ role: "assistant", content: data.content });

    // Extract any text blocks
    const textBlocks = (data.content || []).filter(b => b.type === "text");
    const fullText = textBlocks.map(b => b.text).join("");

    if (data.stop_reason === "end_turn") {
      // We have a final response — try to parse JSON
      if (fullText.trim()) {
        return extractJSON(fullText);
      }
      throw new Error("Model finished but returned no text");
    }

    if (data.stop_reason === "tool_use") {
      // Handle all tool_use blocks — for web_search the results come back automatically
      // We need to return tool_result blocks for each tool_use
      const toolUseBlocks = (data.content || []).filter(b => b.type === "tool_use");
      if (toolUseBlocks.length === 0) break;

      // For web_search_20250305, results are already embedded in the response
      // We just need to pass tool_result back to continue the loop
      const toolResults = toolUseBlocks.map(b => ({
        type: "tool_result",
        tool_use_id: b.id,
        content: b.type === "web_search_20250305" || b.name === "web_search"
          ? (b.content || "Search completed, results available above.")
          : "Done.",
      }));

      if (onLog) onLog("🌐 Searching the web... (round " + rounds + ")");

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // max_tokens or other stop — if we have text try to parse it
    if (fullText.trim()) {
      try { return extractJSON(fullText); } catch (_) {}
    }

    break;
  }

  throw new Error("Agent did not produce a valid JSON response after " + rounds + " rounds");
}

// ─── RESEARCH AGENT ───────────────────────────────────────────────────────────
async function runResearchAgent(company, linkedinUrl, personName, jobTitle, onLog) {
  // Wait 20s on retry to clear rate limit window
  onLog("🔍 Starting deep research on " + company + "...");
  await rateLimitDelay(3000, null, null); // small pause before first call

  const researchPrompt = `You are a B2B sales research agent for Condense (a Kafka-based real-time data streaming platform by Zeliot, Bosch-backed).

Research this target prospect:
- Person: ${personName} (${jobTitle})
- Company: ${company}
- LinkedIn: ${linkedinUrl || "not provided"}

Use web search to find:
1. What ${company} does and their tech stack (search for "${company} tech stack" and "${company} engineering blog")
2. Job postings mentioning Kafka, Spark, data pipelines, streaming (search "${company} kafka jobs" or "${company} data engineer jobs")
3. Recent news — funding, product launches, expansions (search "${company} news 2024 2025")
4. Any data/engineering challenges public (search "${company} engineering challenges" or "${company} case study")

After searching, respond with ONLY this JSON and nothing else — no explanation, no preamble:
{
  "company_overview": "2-3 sentence summary of what they do and their scale",
  "tech_stack_signals": ["signal 1", "signal 2", "signal 3"],
  "pain_points": ["specific pain 1", "specific pain 2", "specific pain 3", "specific pain 4"],
  "recent_news": ["news item 1", "news item 2"],
  "why_condense_fits": "2-3 sentence pitch specific to their situation and tech signals",
  "conversation_hooks": ["specific hook based on research 1", "specific hook 2"],
  "confidence_score": 80
}`;

  const json = await runAgenticLoop({
    system: "You are a B2B research agent. After completing all web searches, you MUST respond with ONLY a valid JSON object — no markdown, no explanation, no preamble. Start your final response with { and end with }.",
    initialUserMsg: researchPrompt,
    max_tokens: 2000,
    onLog,
  });

  onLog("✅ Research complete — " + (json.pain_points?.length || 0) + " pain points identified");
  return json;
}

// ─── MESSAGE GENERATION AGENT ─────────────────────────────────────────────────
async function generateMessages(person, research, onLog) {
  onLog("✍️ Crafting personalized message sequence...");

  // Smart few-shot selection: pick closest matches by seniority + industry, then fill with others
  const seniority = (person.seniority || "").toLowerCase();
  const industry = (person.industry || research.company_overview || "").toLowerCase();

  const scored = trainingData.map(ex => {
    let score = 0;
    if (ex.seniority && seniority && ex.seniority.toLowerCase() === seniority) score += 3;
    if (ex.seniority && seniority && (
      (["cto","cio","ceo"].some(s => seniority.includes(s)) && ["cto","cio","ceo"].some(s => ex.seniority.toLowerCase().includes(s))) ||
      (["vp","avp","director"].some(s => seniority.includes(s)) && ["vp","avp","director"].some(s => ex.seniority.toLowerCase().includes(s))) ||
      (["engineer","lead","specialist"].some(s => seniority.includes(s)) && ["engineer","lead","specialist"].some(s => ex.seniority.toLowerCase().includes(s))) ||
      (["manager","head"].some(s => seniority.includes(s)) && ["manager","head"].some(s => ex.seniority.toLowerCase().includes(s)))
    )) score += 2;
    const industryWords = industry.split(/[\s,/&]+/).filter(w => w.length > 4);
    industryWords.forEach(w => { if (ex.industry.toLowerCase().includes(w)) score += 1; });
    // Prefer examples with longer, richer messages
    const avgLen = ex.messages.reduce((s, m) => s + m.text.length, 0) / (ex.messages.length || 1);
    if (avgLen > 100) score += 1;
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topExamples = scored.slice(0, 5).map(({ ex }) => ex); // Top 5 most relevant (keeps tokens low)

  // Format examples showing stage labels and full message text
  const examplesStr = topExamples.map(ex => {
    // Trim each message to 300 chars to stay within token limits
    const msgs = ex.messages.slice(0, 2).map(m => `  [${m.stage}]: ${m.text.slice(0, 300)}`).join("\n");
    return `---\nPerson: ${ex.name} | ${ex.job_title} | ${ex.company} | Seniority: ${ex.seniority}\nPains: ${ex.pain_primary.slice(0, 150)}\nMessages:\n${msgs}`;
  }).join("\n\n");

  // Build style analysis from ALL training data
  const allFirstMsgs = trainingData.flatMap(ex => ex.messages.filter(m => m.stage === "First Message" || m.stage === "After connection")).map(m => m.text);
  const allFollowUps = trainingData.flatMap(ex => ex.messages.filter(m => m.stage === "Follow Up")).map(m => m.text);
  const avgFirstLen = Math.round(allFirstMsgs.reduce((s, t) => s + t.split(" ").length, 0) / (allFirstMsgs.length || 1));
  const avgFollowLen = Math.round(allFollowUps.reduce((s, t) => s + t.split(" ").length, 0) / (allFollowUps.length || 1));

  const prompt = `You are Veera Raghavan, Country Head – Enterprise Business (India) at Zeliot–Condense (Bosch-backed).

ABOUT CONDENSE: Kafka-based real-time data streaming platform, BYOC (runs in customer own cloud). Managed Kafka + 50+ connectors + transforms + monitoring + schema registry. 40%+ lower TCO vs self-managed Kafka. Backed by Bosch. Customers include TVS Motor, Eicher Motors, Tata Motors, Ashok Leyland, Royal Enfield.

YOUR WRITING STYLE — LEARN FROM THESE REAL MESSAGES YOU SENT:
(${topExamples.length} examples chosen because they match this prospect's seniority/industry most closely)

${examplesStr}

STYLE PATTERNS TO REPLICATE (derived from all ${trainingData.length} training examples):
- Average first message length: ~${avgFirstLen} words
- Average follow-up length: ~${avgFollowLen} words  
- Greeting style: "Greetings [Name]", "Hope you're doing well [Name]", "Hi [Name]. How are you?" — keep it warm but brief
- You often open with what you noticed about THEIR specific role or company before pitching
- Follow-ups are shorter than first messages — sometimes just 1-2 sentences
- You frequently ask for "30 mins based on your availability" or their email ID
- You sometimes mention "I have sent a detailed email" when referencing offline outreach
- Tone shifts: CTO/CIO/CEO = formal strategic framing | Engineer/Lead = technical peer exchange | VP/Head = business impact framing
- You sign off as: Veera Raghavan | Country Head – Enterprise Business | Zeliot–Condense | +91 935-309-4136
- You NEVER use bullet points or em dashes inside LinkedIn messages
- Region matters: India prospects get slightly more casual warm tone; USA/international = more formal

TARGET PROSPECT:
Name: ${person.name}
Role: ${person.jobTitle || "Unknown"}
Company: ${person.company}
LinkedIn: ${person.linkedinUrl || "not provided"}
Seniority: ${person.seniority || "infer from title"}
Region: ${person.region || "India"}

RESEARCH-BACKED CONTEXT (use this to make messages hyper-specific):
Company Overview: ${research.company_overview}
Tech Stack Signals: ${(research.tech_stack_signals || []).join(", ")}
Pain Points Identified: ${(research.pain_points || []).join(" | ")}
Recent News: ${(research.recent_news || []).join(" | ")}
Why Condense Fits: ${research.why_condense_fits}
Conversation Hooks (use one of these to open): ${(research.conversation_hooks || []).join(" | ")}

INSTRUCTIONS:
1. connection_note: MAX 300 chars. Warm, curiosity-driven. Reference 1 specific thing about their role or company. No pitch yet.
2. day0_message: 80-120 words. Open with the strongest conversation hook from research. Name their specific pain. One clear CTA: 30 mins or email.
3. day3_followup: 50-80 words. Different angle from day0. Reference a tech signal or news item. Keep door open.
4. day7_followup: 30-50 words. Softer. Just ask for 30 mins or their email. No hard sell.
5. day14_followup: 20-35 words. Final gentle nudge. Keep door open. No desperation.

Return ONLY this JSON, nothing else, no markdown:
{
  "connection_note": "...",
  "day0_message": "...",
  "day3_followup": "...",
  "day7_followup": "...",
  "day14_followup": "..."
}`;

  const data = await callClaude({
    system: "You are Veera Raghavan. You have been given real examples of your own LinkedIn messages as training data. Study the style, tone, length and structure carefully and replicate it precisely. Return ONLY a valid JSON object — no markdown, no backticks, no explanation. Start with { and end with }.",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1200,
  });

  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  onLog(`✅ Messages crafted using ${topExamples.length} matched training examples`);
  return extractJSON(text);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const FONT = "'Outfit', 'DM Sans', sans-serif";
const DISPLAY = "'Playfair Display', serif";
const MONO = "'IBM Plex Mono', monospace";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Outfit:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #050810;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-image:
      radial-gradient(ellipse 80% 50% at 20% 0%, rgba(14,165,233,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(37,99,235,0.06) 0%, transparent 50%);
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes logIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmerBlue {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(14,165,233,0.3); }
    50%       { box-shadow: 0 0 20px rgba(14,165,233,0.6); }
  }
  @keyframes borderShimmer {
    0%   { border-color: rgba(14,165,233,0.2); }
    50%  { border-color: rgba(14,165,233,0.5); }
    100% { border-color: rgba(14,165,233,0.2); }
  }

  .card-enter   { animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  .log-line     { animation: logIn 0.2s ease; }
  .fade-in      { animation: fadeIn 0.4s ease; }

  input::placeholder { color: #1e3a5f; }
  textarea::placeholder { color: #1e3a5f; }

  input:focus, textarea:focus {
    outline: none;
    border-color: rgba(14,165,233,0.5) !important;
    box-shadow: 0 0 0 2px rgba(14,165,233,0.08), 0 0 12px rgba(14,165,233,0.1);
  }

  .prospect-card:hover {
    background: rgba(14,165,233,0.04) !important;
    border-color: rgba(14,165,233,0.2) !important;
    transform: translateX(2px);
  }
  .prospect-card { transition: all 0.18s ease; }

  .tab-btn:hover { color: #0ea5e9 !important; }
  .glow-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.15);
  }
  .glow-btn { transition: all 0.15s ease; }
`;

const C = {
  // Backgrounds
  bg:          "#050810",
  bgDeep:      "#030508",
  surface:     "#080d1a",
  surfaceAlt:  "#0a1020",
  surfaceMid:  "#0d1526",

  // Borders
  border:      "rgba(14,165,233,0.12)",
  borderBright:"rgba(14,165,233,0.28)",
  borderDim:   "rgba(14,165,233,0.06)",

  // Blue accent system
  gold:        "#0ea5e9",
  goldBright:  "#38bdf8",
  goldDim:     "rgba(14,165,233,0.15)",
  goldDimmer:  "rgba(14,165,233,0.07)",

  // Semantic colors
  green:       "#5de8a0",
  greenDim:    "rgba(93,232,160,0.12)",
  amber:       "#f5a623",
  amberDim:    "rgba(14,165,233,0.12)",
  red:         "#ff6b6b",
  redDim:      "rgba(255,107,107,0.12)",
  blue:        "#60a5fa",
  blueDim:     "rgba(96,165,250,0.12)",
  purple:      "#c084fc",
  purpleDim:   "rgba(192,132,252,0.12)",

  // Text
  text:        "#e2f0ff",
  textMid:     "#6a9ab8",
  textDim:     "#2a4a6a",
  textFaint:   "#162030",
};
const STATUS_CONFIG = {
  idle:        { color: C.textDim,   bg: C.surfaceMid,  label: "Not Started" },
  researching: { color: C.amber,     bg: C.amberDim,    label: "Researching" },
  generating:  { color: C.gold,      bg: C.goldDim,     label: "Generating" },
  ready:       { color: C.green,     bg: C.greenDim,    label: "Ready to Send" },
  sent:        { color: C.blue,      bg: C.blueDim,     label: "Sent" },
  following:   { color: C.purple,    bg: C.purpleDim,   label: "Following Up" },
  done:        { color: C.green,     bg: C.greenDim,    label: "Complete" },
  error:       { color: C.red,       bg: C.redDim,      label: "Error" },
};

const FOLLOWUP_SCHEDULE = [
  { key: "connection_note", label: "Connection Note", day: "Now", icon: "🔗", hint: "Send with connection request · max 300 chars" },
  { key: "day0_message",    label: "First Message",   day: "Day 0",  icon: "💬", hint: "Send right after they accept" },
  { key: "day3_followup",   label: "Follow-Up 1",     day: "Day 3",  icon: "📨", hint: "3 days after first message" },
  { key: "day7_followup",   label: "Follow-Up 2",     day: "Day 7",  icon: "📨", hint: "7 days after first message" },
  { key: "day14_followup",  label: "Follow-Up 3",     day: "Day 14", icon: "📨", hint: "Final nudge — keep door open" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
      fontFamily: MONO, padding: "3px 10px", borderRadius: 3,
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}55`,
      boxShadow: `0 0 8px ${cfg.color}22`,
    }}>{cfg.label}</span>
  );
}

function Spinner() {
  return <div style={{ width: 14, height: 14, border: `1.5px solid ${C.goldDim}`, borderTop: `1.5px solid ${C.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}

function GlowButton({ onClick, disabled, children, color = C.gold, small, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glow-btn"
      style={{
        padding: small ? "6px 14px" : primary ? "11px 24px" : "9px 18px",
        borderRadius: 4,
        border: primary ? `1px solid ${C.gold}` : `1px solid ${color}55`,
        background: primary
          ? `linear-gradient(135deg, rgba(14,165,233,0.2), rgba(212,175,55,0.08))`
          : `rgba(0,0,0,0)`,
        color: disabled ? C.textDim : primary ? C.goldBright : color,
        fontWeight: primary ? 600 : 500,
        fontSize: small ? 11 : 12,
        letterSpacing: primary ? "0.04em" : "0.02em",
        fontFamily: FONT,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        display: "flex", alignItems: "center", gap: 6,
        boxShadow: primary ? `0 0 20px rgba(14,165,233,0.15), inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
        backdropFilter: "blur(4px)",
      }}
    >{children}</button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "rgba(0,0,0,0.4)", border: `1px solid ${C.border}`, color: C.text,
          borderRadius: 3, padding: "9px 12px", fontSize: 12, fontFamily: FONT,
          outline: "none", transition: "all 0.2s",
          backdropFilter: "blur(4px)",
        }}
      />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [prospects, setProspects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(() => {
  const p = new URLSearchParams(window.location.search);
  return {
    name: p.get("name") || "",
    jobTitle: p.get("jobTitle") || "",
    company: p.get("company") || "",
    linkedinUrl: p.get("linkedinUrl") || "",
  };
});
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupStatus, setLookupStatus] = useState("");

  const lookupProfile = async () => {
    if (!form.linkedinUrl) return;
    setLookupLoading(true);
    setLookupStatus("");
    try {
      const info = await lookupLinkedIn(form.linkedinUrl, setLookupStatus);
      setForm(prev => ({
        ...prev,
        name: info.name || prev.name,
        jobTitle: info.jobTitle || prev.jobTitle,
        company: info.company || prev.company,
        industry: info.industry || prev.industry,
        seniority: info.seniority || prev.seniority,
        region: info.region || prev.region,
      }));
      setLookupStatus("✅ Form auto-filled! Review and click Add Prospect.");
    } catch (err) {
      setLookupStatus("⚠️ Could not extract profile. Fill manually.");
    } finally {
      setLookupLoading(false);
    }
  };
  const [logs, setLogs] = useState({});       // id -> string[]
  const [research, setResearch] = useState({}); // id -> research obj
  const [messages, setMessages] = useState({}); // id -> messages obj
  const [edits, setEdits] = useState({});       // id_key -> edited text
  const [activeMsg, setActiveMsg] = useState(null); // which message tab is open
  const [running, setRunning] = useState(null);
  const logsEndRef = useRef();

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (id, msg) => setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), msg] }));

  const addProspect = () => {
    if (!form.name || !form.company) return;
    const id = `p_${Date.now()}`;
    setProspects(prev => [...prev, { ...form, id, status: "idle", createdAt: new Date(), sentAt: null }]);
    setSelected(id);
    setForm({ name: "", jobTitle: "", company: "", linkedinUrl: "" });
  };

  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus("📂 Reading file...");
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    const parseRows = (rows) => {
      // Normalize headers
      const headers = rows[0].map(h => (h || "").toString().toLowerCase().trim());
      const find = (...keys) => headers.findIndex(h => keys.some(k => h.includes(k)));
      const nameIdx    = find("name", "full name", "contact");
      const titleIdx   = find("title", "job", "position", "designation", "role");
      const companyIdx = find("company", "organization", "org", "employer");
      const emailIdx   = find("email", "mail");
      const phoneIdx   = find("phone", "mobile", "contact number");
      const linkedinIdx= find("linkedin", "profile url", "url");

      const added = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name    = nameIdx >= 0 ? (row[nameIdx] || "").toString().trim() : "";
        const company = companyIdx >= 0 ? (row[companyIdx] || "").toString().trim() : "";
        if (!name && !company) continue;
        const id = `p_${Date.now()}_${i}`;
        added.push({
          id,
          name: name || "Unknown",
          jobTitle:    titleIdx >= 0    ? (row[titleIdx]    || "").toString().trim() : "",
          company:     company || "Unknown",
          email:       emailIdx >= 0    ? (row[emailIdx]    || "").toString().trim() : "",
          phone:       phoneIdx >= 0    ? (row[phoneIdx]    || "").toString().trim() : "",
          linkedinUrl: linkedinIdx >= 0 ? (row[linkedinIdx] || "").toString().trim() : "",
          status: "idle", createdAt: new Date(), sentAt: null,
        });
      }
      setProspects(prev => [...prev, ...added]);
      setUploadStatus(`✅ ${added.length} prospects imported!`);
      if (added.length > 0) setSelected(added[0].id);
      setTimeout(() => setUploadStatus(""), 4000);
    };

    if (ext === "csv") {
      reader.onload = (ev) => {
        const text = ev.target.result;
        const rows = text.split(/\r?\n/).filter(l => l.trim()).map(l => {
          // Simple CSV parse (handles quoted fields)
          const result = [];
          let cur = "", inQ = false;
          for (const ch of l) {
            if (ch === '"') { inQ = !inQ; }
            else if (ch === "," && !inQ) { result.push(cur); cur = ""; }
            else cur += ch;
          }
          result.push(cur);
          return result;
        });
        parseRows(rows);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      reader.onload = (ev) => {
        try {
          const XLSX = window.XLSX;
          if (!XLSX) { setUploadStatus("❌ Excel support not loaded. Use CSV instead."); return; }
          const wb = XLSX.read(ev.target.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          parseRows(rows);
        } catch (err) {
          setUploadStatus("❌ Error reading Excel: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus("❌ Please upload a .csv or .xlsx file");
    }
    e.target.value = "";
  };

  const runAgent = async (prospect) => {
    const id = prospect.id;
    setRunning(id);
    setSelected(id);
    setActiveMsg(null);
    setLogs(prev => ({ ...prev, [id]: [] }));

    const updateStatus = (status) => setProspects(prev => prev.map(p => p.id === id ? { ...p, status } : p));

    try {
      // Phase 1: Research
      updateStatus("researching");
      const researchData = await runResearchAgent(
        prospect.company, prospect.linkedinUrl, prospect.name, prospect.jobTitle,
        (msg) => addLog(id, msg)
      );
      setResearch(prev => ({ ...prev, [id]: cleanResearch(researchData) }));

      // Phase 2: Generate messages
      updateStatus("generating");
      addLog(id, "⏳ Pausing 30s to respect API rate limits...");
      await new Promise(r => setTimeout(r, 30000));
      const msgs = await generateMessages(prospect, researchData, (msg) => addLog(id, msg));
      setMessages(prev => ({ ...prev, [id]: msgs }));
      setActiveMsg("connection_note");

      updateStatus("ready");
      addLog(id, "🚀 Agent complete! Review and send messages below.");
    } catch (err) {
      updateStatus("error");
      addLog(id, "❌ Error: " + err.message);
    } finally {
      setRunning(null);
    }
  };

  const markSent = (id) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, status: "following", sentAt: new Date() } : p));
  };

  // ── BATCH QUEUE ──────────────────────────────────────────────────────────────
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchFrom, setBatchFrom] = useState(1);
  const [batchTo, setBatchTo] = useState(30);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, done: [] });
  const batchCancelRef = useRef(false);

  const runBatch = async () => {
    const idleProspects = prospects.filter(p => p.status === "idle");
    const from = Math.max(1, batchFrom) - 1;
    const to   = Math.min(idleProspects.length, batchTo);
    const queue = idleProspects.slice(from, to);
    if (queue.length === 0) return;

    setBatchRunning(true);
    batchCancelRef.current = false;
    setBatchProgress({ current: 0, total: queue.length, done: [] });
    setBatchOpen(false);

    for (let i = 0; i < queue.length; i++) {
      if (batchCancelRef.current) break;
      const prospect = queue[i];
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      await runAgent(prospect);
      setBatchProgress(prev => ({ ...prev, done: [...prev.done, prospect.id] }));
      // Small gap between prospects to respect rate limits
      if (i < queue.length - 1 && !batchCancelRef.current) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    setBatchRunning(false);
    setBatchProgress(prev => ({ ...prev, current: 0 }));
  };

  const cancelBatch = () => {
    batchCancelRef.current = true;
    setBatchRunning(false);
  };

  const getDaysUntilFollowup = (prospect, dayNum) => {
    if (!prospect.sentAt) return null;
    const sent = new Date(prospect.sentAt);
    const target = new Date(sent.getTime() + dayNum * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const sel = prospects.find(p => p.id === selected);
  const selResearch = selected ? research[selected] : null;
  const selMessages = selected ? messages[selected] : null;

  return (
    <>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" />
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, display: "flex", flexDirection: "column", fontSmoothing: "antialiased" }}>

        {/* HEADER */}
        <div style={{
          background: `linear-gradient(180deg, rgba(5,8,20,0.98) 0%, rgba(3,6,15,0.95) 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100, height: 64,
          backdropFilter: "blur(20px)",
          boxShadow: "0 1px 0 rgba(14,165,233,0.08), 0 4px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Logo mark */}
            <div style={{
              width: 36, height: 36, borderRadius: 6,
              background: "linear-gradient(135deg, #0a1535, #050d20)",
              border: `1px solid ${C.gold}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 16px rgba(14,165,233,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}>
              <span style={{ fontSize: 15, fontFamily: DISPLAY, color: C.gold, fontWeight: 700 }}>C</span>
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 16, color: C.text, letterSpacing: "0.01em", lineHeight: 1.2 }}>Condense Outreach</div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.08em" }}>AGENTIC · RESEARCH · PERSONALIZED</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 1, height: 24, background: C.border, margin: "0 4px" }} />
            {[
              { n: prospects.filter(p => p.status === "ready" || p.status === "following").length, label: "Active", color: C.green },
              { n: prospects.filter(p => p.status === "done").length, label: "Done", color: C.textMid },
            ].map(b => (
              <div key={b.label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 18, fontFamily: DISPLAY, fontWeight: 600, color: b.n > 0 ? b.color : C.textFaint, lineHeight: 1 }}>{b.n}</span>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.06em" }}>{b.label}</span>
              </div>
            ))}

            <div style={{ width: 1, height: 24, background: C.border, margin: "0 4px" }} />

            {/* Batch progress indicator */}
            {batchRunning && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 4, background: C.goldDim, border: `1px solid ${C.gold}44` }}>
                <Spinner />
                <span style={{ fontSize: 11, fontFamily: MONO, color: C.gold }}>
                  Batch {batchProgress.current}/{batchProgress.total}
                </span>
                <button onClick={cancelBatch} style={{ fontSize: 10, fontFamily: MONO, color: C.red, background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>✕ Stop</button>
              </div>
            )}

            {/* Batch Run Button */}
            {!batchRunning && prospects.filter(p => p.status === "idle").length > 0 && (
              <GlowButton onClick={() => setBatchOpen(true)} color={C.gold} primary>
                ⚡ Batch Run
              </GlowButton>
            )}
          </div>
        </div>

        {/* BATCH MODAL */}
        {batchOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setBatchOpen(false)}>
            <div style={{ background: C.surface, border: `1px solid ${C.borderBright}`, borderRadius: 8, padding: 28, width: 380, boxShadow: `0 0 40px rgba(14,165,233,0.15)` }}
              onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 6 }}>Batch Generate</div>
              <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, marginBottom: 20 }}>
                {prospects.filter(p => p.status === "idle").length} idle prospects available
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>FROM (prospect #)</label>
                  <input type="number" min={1} max={prospects.filter(p=>p.status==="idle").length}
                    value={batchFrom} onChange={e => setBatchFrom(Number(e.target.value))}
                    style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: `1px solid ${C.border}`, color: C.text, borderRadius: 4, padding: "9px 12px", fontSize: 14, fontFamily: MONO, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>TO (prospect #)</label>
                  <input type="number" min={1} max={prospects.filter(p=>p.status==="idle").length}
                    value={batchTo} onChange={e => setBatchTo(Number(e.target.value))}
                    style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: `1px solid ${C.border}`, color: C.text, borderRadius: 4, padding: "9px 12px", fontSize: 14, fontFamily: MONO, outline: "none" }} />
                </div>
              </div>

              <div style={{ padding: "12px 16px", borderRadius: 4, background: C.goldDimmer, border: `1px solid ${C.borderDim}`, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.textMid, fontFamily: MONO, lineHeight: 1.7 }}>
                  Will generate messages for <span style={{ color: C.gold }}>{Math.max(0, Math.min(batchTo, prospects.filter(p=>p.status==="idle").length) - Math.max(0, batchFrom - 1))}</span> prospects.<br />
                  Estimated time: ~<span style={{ color: C.gold }}>{Math.round(Math.max(0, Math.min(batchTo, prospects.filter(p=>p.status==="idle").length) - Math.max(0, batchFrom - 1)) * 0.7)} min</span> (40s per prospect)
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <GlowButton onClick={() => setBatchOpen(false)} color={C.textMid}>Cancel</GlowButton>
                <GlowButton onClick={runBatch} primary color={C.gold}>⚡ Start Batch</GlowButton>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 64px)" }}>

          {/* LEFT SIDEBAR */}
          <div style={{
            width: 290,
            background: "linear-gradient(180deg, #060c1a 0%, #040810 100%)",
            borderRight: `1px solid ${C.border}`,
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>

            {/* Add Prospect Form */}
            <div style={{ padding: "20px 18px", borderBottom: `1px solid ${C.borderDim}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.border})` }} />
                <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, whiteSpace: "nowrap" }}>New Prospect</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* LinkedIn URL */}
                <div>
                  <label style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 5 }}>LinkedIn URL</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input
                      style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: `1px solid ${C.border}`, color: C.text, borderRadius: 3, padding: "8px 11px", fontSize: 12, fontFamily: FONT, outline: "none", transition: "all 0.2s" }}
                      value={form.linkedinUrl}
                      onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))}
                      placeholder="linkedin.com/in/..."
                      onKeyDown={e => e.key === "Enter" && lookupProfile()}
                    />
                    <button
                      onClick={lookupProfile}
                      disabled={!form.linkedinUrl || lookupLoading}
                      style={{
                        padding: "0 11px", borderRadius: 3,
                        border: `1px solid ${C.borderBright}`,
                        background: lookupLoading ? C.goldDim : "rgba(14,165,233,0.08)",
                        color: !form.linkedinUrl ? C.textFaint : C.gold,
                        cursor: !form.linkedinUrl || lookupLoading ? "not-allowed" : "pointer",
                        fontSize: 13, flexShrink: 0, transition: "all 0.15s",
                      }}
                      title="Auto-fill from LinkedIn"
                    >{lookupLoading ? "⌛" : "⌕"}</button>
                  </div>
                  {lookupStatus && (
                    <div style={{ fontSize: 10, fontFamily: MONO, marginTop: 5, padding: "4px 8px", borderRadius: 3, background: lookupStatus.startsWith("✅") ? C.greenDim : lookupStatus.startsWith("⚠") ? C.amberDim : C.goldDimmer, color: lookupStatus.startsWith("✅") ? C.green : lookupStatus.startsWith("⚠") ? C.amber : C.gold }}>{lookupStatus}</div>
                  )}
                </div>
                <Input label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="John Smith" />
                <Input label="Job Title" value={form.jobTitle} onChange={v => setForm(p => ({ ...p, jobTitle: v }))} placeholder="VP Engineering" />
                <Input label="Company *" value={form.company} onChange={v => setForm(p => ({ ...p, company: v }))} placeholder="Acme Corp" />
                <GlowButton onClick={addProspect} disabled={!form.name || !form.company} primary>
                  + Add Prospect
                </GlowButton>

                {/* CSV/Excel Upload */}
                <div style={{ marginTop: 4 }}>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: "none" }} />
                  <button onClick={() => fileInputRef.current.click()} style={{
                    width: "100%", padding: "9px", borderRadius: 4,
                    border: `1px dashed ${C.border}`,
                    background: "transparent", color: C.textMid,
                    fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.15s",
                  }}>
                    ↑ Upload CSV / Excel
                  </button>
                  {uploadStatus && (
                    <div style={{ fontSize: 10, fontFamily: MONO, marginTop: 5, padding: "4px 8px", borderRadius: 3,
                      background: uploadStatus.startsWith("✅") ? C.greenDim : uploadStatus.startsWith("❌") ? C.redDim : C.goldDimmer,
                      color: uploadStatus.startsWith("✅") ? C.green : uploadStatus.startsWith("❌") ? C.red : C.gold,
                    }}>{uploadStatus}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Prospect List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
              {prospects.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>◈</div>
                  <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, fontFamily: MONO }}>Add your first prospect above to begin</div>
                </div>
              ) : (
                prospects.map(p => (
                  <div key={p.id} className="card-enter prospect-card" onClick={() => setSelected(p.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 4, marginBottom: 4, cursor: "pointer",
                      background: selected === p.id ? "rgba(14,165,233,0.07)" : "transparent",
                      border: `1px solid ${selected === p.id ? C.borderBright : "transparent"}`,
                      borderLeft: selected === p.id ? `2px solid ${C.gold}` : "2px solid transparent",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: selected === p.id ? C.text : C.textMid, lineHeight: 1.3, fontFamily: FONT }}>{p.name}</div>
                      {running === p.id && <Spinner />}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, fontFamily: MONO }}>{p.company}</div>
                    <div style={{ marginTop: 7 }}><Badge status={p.status} /></div>
                    {p.status === "following" && (
                      <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {[3, 7, 14].map(day => {
                          const d = getDaysUntilFollowup(p, day);
                          const isDue = d !== null && d <= 0;
                          const isSoon = d !== null && d > 0 && d <= 1;
                          return (
                            <span key={day} style={{
                              fontSize: 9, fontFamily: MONO, padding: "2px 6px", borderRadius: 2,
                              background: isDue ? C.redDim : isSoon ? C.amberDim : "rgba(255,255,255,0.03)",
                              color: isDue ? C.red : isSoon ? C.amber : C.textDim,
                              border: `1px solid ${isDue ? C.red + "44" : isSoon ? C.amber + "44" : C.borderDim}`,
                            }}>D{day}: {isDue ? "DUE" : d === 0 ? "today" : `${d}d`}</span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: C.bg }}>
            {!sel ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(14,165,233,0.03)",
                }}>
                  <span style={{ fontSize: 28, opacity: 0.4 }}>◈</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, color: C.textMid, marginBottom: 6, fontWeight: 500 }}>Select a prospect to begin</div>
                  <div style={{ fontSize: 12, color: C.textDim, fontFamily: MONO, lineHeight: 1.7, maxWidth: 340 }}>
                    The agent will research their company,<br/>identify pain points, and craft personalized messages
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 880, margin: "0 auto" }}>

                {/* Prospect Header */}
                <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.borderDim}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h1 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: "0.01em", marginBottom: 6, lineHeight: 1.2 }}>{sel.name}</h1>
                      <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, letterSpacing: "0.02em" }}>
                        {sel.jobTitle && <span style={{ color: C.textMid }}>{sel.jobTitle}</span>}
                        {sel.jobTitle && sel.company && <span style={{ color: C.textDim, margin: "0 8px" }}>·</span>}
                        {sel.company && <span style={{ color: C.gold, opacity: 0.8 }}>{sel.company}</span>}
                      </div>
                      {sel.linkedinUrl && (
                        <a href={sel.linkedinUrl.startsWith("http") ? sel.linkedinUrl : "https://" + sel.linkedinUrl}
                          target="_blank" rel="noreferrer"
                          style={{ fontSize: 10, color: C.gold, textDecoration: "none", fontFamily: MONO, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, opacity: 0.7, letterSpacing: "0.06em" }}>
                          ↗ LINKEDIN PROFILE
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 16 }}>
                      <Badge status={sel.status} />
                      {(sel.status === "idle" || sel.status === "error") && (
                        <GlowButton onClick={() => runAgent(sel)} disabled={running !== null} primary>
                          {running === sel.id ? <><Spinner /> Running...</> : "⚡  Run Agent"}
                        </GlowButton>
                      )}
                      {sel.status === "ready" && (
                        <GlowButton onClick={() => markSent(sel.id)} color={C.green} primary>✓ Mark Sent</GlowButton>
                      )}
                      {sel.status === "following" && (
                        <GlowButton onClick={() => setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, status: "done" } : p))} color={C.green} small>✓ Complete</GlowButton>
                      )}
                    </div>
                  </div>
                </div>

                {/* Agent Log */}
                {logs[sel.id]?.length > 0 && (
                  <div style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${C.borderDim}`, borderRadius: 4, padding: "14px 16px", marginBottom: 20, backdropFilter: "blur(8px)" }}>
                    <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: running === sel.id ? C.amber : C.green, boxShadow: running === sel.id ? `0 0 6px ${C.amber}` : "none" }} />
                      Agent Log
                    </div>
                    <div style={{ maxHeight: 120, overflowY: "auto" }}>
                      {logs[sel.id].map((log, i) => (
                        <div key={i} className="log-line" style={{ fontSize: 11, fontFamily: MONO, color: log.startsWith("✅") ? C.green : log.startsWith("❌") ? C.red : log.startsWith("🌐") ? C.gold : C.textDim, padding: "2px 0", lineHeight: 1.7 }}>{log}</div>
                      ))}
                      {running === sel.id && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, padding: "6px 0", borderTop: `1px solid ${C.borderDim}` }}>
                          <Spinner />
                          <span style={{ fontSize: 11, fontFamily: MONO, color: C.gold, opacity: 0.7 }}>Processing...</span>
                        </div>
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}

                {/* Research Panel */}
                {selResearch && (
                  <div style={{ marginBottom: 20 }} className="card-enter">
                    {/* Section label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO }}>Research Report</span>
                      {selResearch.confidence_score && (
                        <span style={{ fontSize: 9, fontFamily: MONO, color: C.gold, opacity: 0.7 }}>{selResearch.confidence_score}% confidence</span>
                      )}
                      <div style={{ flex: 1, height: 1, background: C.borderDim }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {/* Pain Points */}
                      <div style={{ background: "rgba(14,165,233,0.03)", border: `1px solid rgba(14,165,233,0.12)`, borderRadius: 4, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.amber, fontFamily: MONO, marginBottom: 12, opacity: 0.8 }}>Pain Points</div>
                        {(selResearch.pain_points || []).map((pt, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "5px 0", borderBottom: i < selResearch.pain_points.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", lineHeight: 1.5, display: "flex", gap: 8 }}>
                            <span style={{ color: C.amber, opacity: 0.5, flexShrink: 0 }}>—</span>{pt}
                          </div>
                        ))}
                      </div>

                      {/* Tech Stack */}
                      <div style={{ background: "rgba(14,165,233,0.03)", border: `1px solid ${C.borderDim}`, borderRadius: 4, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, fontFamily: MONO, marginBottom: 12, opacity: 0.8 }}>Tech Signals</div>
                        {(selResearch.tech_stack_signals || []).map((s, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "5px 0", borderBottom: i < selResearch.tech_stack_signals.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", display: "flex", gap: 8 }}>
                            <span style={{ color: C.gold, opacity: 0.4, flexShrink: 0 }}>·</span>{s}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderDim}`, borderRadius: 4, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Company Overview</div>
                        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{selResearch.company_overview}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.borderDim}`, borderRadius: 4, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Recent News</div>
                        {(selResearch.recent_news || []).map((n, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "4px 0", lineHeight: 1.5, display: "flex", gap: 8 }}>
                            <span style={{ color: C.textDim, opacity: 0.5, flexShrink: 0 }}>·</span>{n}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Why Condense Fits */}
                    <div style={{ background: "rgba(93,232,160,0.03)", border: `1px solid rgba(93,232,160,0.15)`, borderRadius: 4, padding: 16 }}>
                      <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.green, fontFamily: MONO, marginBottom: 10, opacity: 0.8 }}>Why Condense Fits</div>
                      <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.8, fontStyle: "italic" }}>{selResearch.why_condense_fits}</div>
                    </div>
                  </div>
                )}

                {/* Messages Panel */}
                {selMessages && (
                  <div className="card-enter">
                    {/* Section label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO }}>Generated Messages</span>
                      <div style={{ flex: 1, height: 1, background: C.borderDim }} />
                    </div>

                    {/* Message Tabs */}
                    <div style={{ display: "flex", borderBottom: `1px solid ${C.borderDim}`, overflowX: "auto", marginBottom: 0, gap: 0 }}>
                      {FOLLOWUP_SCHEDULE.map(m => {
                        const isActive = activeMsg === m.key;
                        let dayStatus = "future";
                        if (sel.sentAt) {
                          const dayNum = m.key === "connection_note" ? -1 : m.key === "day0_message" ? 0 : parseInt(m.key.replace("day", ""));
                          if (dayNum <= 0) dayStatus = "due";
                          else {
                            const d = getDaysUntilFollowup(sel, dayNum);
                            dayStatus = d <= 0 ? "due" : d <= 1 ? "soon" : "future";
                          }
                        }
                        const dotColor = dayStatus === "due" ? C.green : dayStatus === "soon" ? C.amber : C.textDim;
                        return (
                          <button key={m.key} className="tab-btn" onClick={() => setActiveMsg(m.key)} style={{
                            padding: "10px 16px", border: "none",
                            background: isActive ? "rgba(14,165,233,0.06)" : "transparent",
                            cursor: "pointer",
                            borderBottom: isActive ? `1px solid ${C.gold}` : "1px solid transparent",
                            color: isActive ? C.text : C.textDim,
                            fontFamily: MONO, fontSize: 10, fontWeight: isActive ? 500 : 400,
                            letterSpacing: "0.06em",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                            minWidth: 80, transition: "all 0.15s",
                          }}>
                            <span style={{ fontSize: 9, color: dotColor, letterSpacing: "0.1em" }}>{m.day}</span>
                            <span style={{ whiteSpace: "nowrap", textTransform: "uppercase", fontSize: 9 }}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Message */}
                    {activeMsg && (() => {
                      const msgDef = FOLLOWUP_SCHEDULE.find(m => m.key === activeMsg);
                      const editKey = `${sel.id}_${activeMsg}`;
                      const text = edits[editKey] ?? selMessages[activeMsg] ?? "";
                      const maxLen = activeMsg === "connection_note" ? 300 : null;
                      return (
                        <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.borderDim}`, borderTop: "none", borderRadius: "0 0 4px 4px", padding: 20 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <div>
                              <div style={{ fontFamily: DISPLAY, fontWeight: 500, color: C.text, fontSize: 14 }}>{msgDef.label}</div>
                              <div style={{ fontSize: 10, color: C.textDim, marginTop: 3, fontFamily: MONO, letterSpacing: "0.04em" }}>{msgDef.hint}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              {maxLen && (
                                <span style={{ fontSize: 10, fontFamily: MONO, color: text.length > maxLen ? C.red : C.textDim }}>{text.length}/{maxLen}</span>
                              )}
                              <GlowButton small onClick={() => navigator.clipboard.writeText(text)} color={C.textMid}>Copy</GlowButton>
                              {sel.linkedinUrl && (
                                <GlowButton small color={C.gold}
                                  onClick={() => window.open(sel.linkedinUrl.startsWith("http") ? sel.linkedinUrl : "https://" + sel.linkedinUrl, "_blank")}>
                                  ↗ LinkedIn
                                </GlowButton>
                              )}
                            </div>
                          </div>
                          <textarea
                            value={text}
                            onChange={e => setEdits(prev => ({ ...prev, [editKey]: e.target.value }))}
                            style={{
                              width: "100%",
                              background: "rgba(0,0,0,0.4)",
                              border: `1px solid ${C.border}`,
                              color: C.text, borderRadius: 3, padding: "14px 16px",
                              fontSize: 13, fontFamily: FONT, lineHeight: 1.8,
                              resize: "vertical", outline: "none",
                              minHeight: activeMsg === "day0_message" ? 180 : 130,
                              transition: "all 0.2s",
                            }}
                          />
                          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.04em" }}>
                              {activeMsg !== "connection_note" ? "Copy → paste into LinkedIn" : "Copy → paste when sending request"}
                            </div>
                            {edits[editKey] !== undefined && (
                              <GlowButton small color={C.textDim} onClick={() => setEdits(prev => { const n = { ...prev }; delete n[editKey]; return n; })}>↺ Reset</GlowButton>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Follow-up Timeline */}
                {sel.status === "following" && sel.sentAt && (
                  <div style={{ marginTop: 20 }} className="card-enter">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO }}>Follow-Up Timeline</span>
                      <div style={{ flex: 1, height: 1, background: C.borderDim }} />
                    </div>
                    <div style={{ display: "flex", gap: 0, position: "relative" }}>
                      <div style={{ position: "absolute", top: 14, left: "12.5%", right: "12.5%", height: 1, background: `linear-gradient(90deg, ${C.border}, ${C.border})`, zIndex: 0 }} />
                      {[
                        { label: "Sent", day: 0, key: "day0_message" },
                        { label: "Day 3", day: 3, key: "day3_followup" },
                        { label: "Day 7", day: 7, key: "day7_followup" },
                        { label: "Day 14", day: 14, key: "day14_followup" },
                      ].map((step, i, arr) => {
                        const d = getDaysUntilFollowup(sel, step.day);
                        const isDue = d <= 0;
                        const color = isDue ? C.green : C.textDim;
                        return (
                          <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: isDue ? "rgba(93,232,160,0.15)" : "rgba(0,0,0,0.6)",
                              border: `1px solid ${isDue ? C.green : C.border}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, color: isDue ? C.green : C.textDim,
                              boxShadow: isDue ? `0 0 14px rgba(93,232,160,0.3)` : "none",
                              backdropFilter: "blur(4px)",
                            }}>
                              {isDue ? "✓" : "·"}
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 500, color, fontFamily: MONO, letterSpacing: "0.04em" }}>{step.label}</div>
                            {step.day > 0 && (
                              <div style={{ fontSize: 9, fontFamily: MONO, color: isDue ? C.green : C.amber, opacity: 0.8 }}>
                                {isDue ? "send now" : `in ${d}d`}
                              </div>
                            )}
                            {isDue && step.day > 0 && (
                              <GlowButton small color={C.green} onClick={() => { setActiveMsg(step.key); }}>View →</GlowButton>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
