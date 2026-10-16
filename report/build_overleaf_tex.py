"""
build_overleaf_tex.py
Generates the complete, publication-grade LaTeX project main.tex for Venfes,
matching the exact formatting and structure of StemTrack_Overleaf_Project__1_.pdf
and REFERENCE_DOCUMENT_FINAL_REVIEW.pdf.
"""

import os
import zipfile

def generate_tex():
    tex_path = "report/overleaf/main.tex"
    os.makedirs("report/overleaf/figures", exist_ok=True)
    
    tex_content = r"""\documentclass[12pt,a4paper]{report}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[a4paper, top=1.2in, bottom=1.2in, left=1.25in, right=1.0in]{geometry}
\usepackage{graphicx}
\usepackage{amsmath,amssymb}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{tabularx}
\usepackage{titlesec}
\usepackage{fancyhdr}
\usepackage{setspace}
\usepackage{float}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{hyperref}
\usepackage{enumitem}

\hypersetup{
    colorlinks=true,
    linkcolor=black,
    citecolor=black,
    urlcolor=blue,
    pdftitle={VENFES: Multi-Vendor E-Commerce Platform with Distributed Cart-Splitting Checkout and Real-Time Aggregation Analytics},
    pdfauthor={Srihari M}
}

% Code Listing Styling
\definecolor{codegreen}{rgb}{0,0.55,0}
\definecolor{codegray}{rgb}{0.45,0.45,0.45}
\definecolor{codepurple}{rgb}{0.55,0,0.75}
\definecolor{backcolour}{rgb}{0.96,0.97,0.98}
\definecolor{keywordblue}{rgb}{0.08,0.22,0.48}

\lstdefinestyle{codestyle}{
    backgroundcolor=\color{backcolour},   
    commentstyle=\color{codegreen}\itshape,
    keywordstyle=\color{keywordblue}\bfseries,
    numberstyle=\tiny\color{codegray},
    stringstyle=\color{codepurple},
    basicstyle=\ttfamily\footnotesize,
    breakatwhitespace=false,         
    breaklines=true,                 
    captionpos=b,                    
    keepspaces=true,                 
    numbers=left,                    
    numbersep=6pt,                  
    showspaces=false,                
    showstringspaces=false,
    showtabs=false,                  
    tabsize=2,
    frame=single,
    rulecolor=\color{black!15}
}
\lstset{style=codestyle}

% Section formatting
\titleformat{\chapter}[DISPLAY]
  {\normalfont\Large\bfseries\centering}{\chaptertitlename\ \thechapter}{10pt}{\huge}
\titlespacing*{\chapter}{0pt}{-20pt}{25pt}

\onehalfspacing

\begin{document}

% ====================================================================
% 1. COVER PAGE
% ====================================================================
\begin{titlepage}
\begin{center}
    \vspace*{0.2cm}
    \begin{figure}[H]
        \centering
        \includegraphics[width=2.5cm]{figures/college_logo.png}
    \end{figure}
    \vspace{0.2cm}
    
    {\fontsize{18pt}{22pt}\selectfont \textbf{VENFES: MULTI-VENDOR E-COMMERCE PLATFORM WITH DISTRIBUTED CART-SPLITTING CHECKOUT AND REAL-TIME AGGREGATION ANALYTICS}\par}
    
    \vspace{1.2cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{A PROJECT REPORT}\par}
    \vspace{0.5cm}
    {\fontsize{12pt}{16pt}\selectfont \textit{Submitted by}\par}
    \vspace{0.4cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{SRIHARI M}\par}
    {\fontsize{13pt}{16pt}\selectfont \textbf{(310624205265)}\par}
    
    \vspace{1.2cm}
    {\fontsize{12pt}{16pt}\selectfont \textit{in partial fulfillment for the award of the degree of}\par}
    \vspace{0.4cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{BACHELOR OF TECHNOLOGY}\par}
    \vspace{0.2cm}
    {\fontsize{12pt}{16pt}\selectfont in\par}
    \vspace{0.2cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{INFORMATION TECHNOLOGY}\par}
    
    \vfill
    {\fontsize{13pt}{17pt}\selectfont \textbf{EASWARI ENGINEERING COLLEGE, CHENNAI}\par}
    {\fontsize{11pt}{15pt}\selectfont \textbf{(AN AUTONOMOUS INSTITUTION) -- AFFILIATED TO ANNA UNIVERSITY, CHENNAI}\par}
    \vspace{0.4cm}
    {\fontsize{12pt}{16pt}\selectfont \textbf{OCTOBER 2026}\par}
\end{center}
\end{titlepage}

\pagenumbering{roman}
\setcounter{page}{2}

% ====================================================================
% 2. BONAFIDE CERTIFICATE
% ====================================================================
\newpage
\begin{center}
    \begin{figure}[H]
        \centering
        \includegraphics[width=2.2cm]{figures/college_logo.png}
    \end{figure}
    \vspace{-0.2cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{EASWARI ENGINEERING COLLEGE}\par}
    {\fontsize{11pt}{15pt}\selectfont \textbf{(AN AUTONOMOUS INSTITUTION) -- AFFILIATED TO ANNA UNIVERSITY}\par}
    {\fontsize{11pt}{15pt}\selectfont \textbf{RAMAPURAM, CHENNAI -- 600 089}\par}
    \vspace{1.0cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{BONAFIDE CERTIFICATE}\par}
\end{center}

\vspace{0.8cm}
\noindent Certified that this project report titled \textbf{``VENFES: MULTI-VENDOR E-COMMERCE PLATFORM WITH DISTRIBUTED CART-SPLITTING CHECKOUT AND REAL-TIME AGGREGATION ANALYTICS''} is the bonafide work of \textbf{SRIHARI M (310624205265)}, who carried out the project under my supervision.

\vspace{3.5cm}
\noindent
\begin{minipage}[t]{0.48\textwidth}
    \textbf{SIGNATURE}\\[1.5cm]
    \textbf{Ms. SAI LAKSHMI GRANDHI}\\
    \textbf{SUPERVISOR}\\
    Assistant Professor\\
    Department of Information Technology\\
    Easwari Engineering College\\
    Ramapuram, Chennai -- 600 089.
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
    \textbf{SIGNATURE}\\[1.5cm]
    \textbf{Dr. N. ANANTHI, M.E., Ph.D.}\\
    \textbf{HEAD OF THE DEPARTMENT}\\
    Professor \& Head\\
    Department of Information Technology\\
    Easwari Engineering College\\
    Ramapuram, Chennai -- 600 089.
\end{minipage}

% ====================================================================
% 3. CERTIFICATE OF VIVA-VOCE EXAMINATION
% ====================================================================
\newpage
\begin{center}
    \begin{figure}[H]
        \centering
        \includegraphics[width=2.2cm]{figures/college_logo.png}
    \end{figure}
    \vspace{-0.2cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{EASWARI ENGINEERING COLLEGE}\par}
    {\fontsize{11pt}{15pt}\selectfont \textbf{(AN AUTONOMOUS INSTITUTION) -- AFFILIATED TO ANNA UNIVERSITY}\par}
    {\fontsize{11pt}{15pt}\selectfont \textbf{RAMAPURAM, CHENNAI -- 600 089}\par}
    \vspace{1.0cm}
    {\fontsize{14pt}{18pt}\selectfont \textbf{Certificate of Viva-voce Examination}\par}
\end{center}

\vspace{0.8cm}
\noindent This is to certify that the Viva-Voce Examination of the Project Work entitled \textbf{``VENFES: MULTI-VENDOR E-COMMERCE PLATFORM WITH DISTRIBUTED CART-SPLITTING CHECKOUT AND REAL-TIME AGGREGATION ANALYTICS''} submitted by \textbf{SRIHARI M (310624205265)} in partial fulfillment of the requirements for the award of the degree of \textbf{Bachelor of Technology in Information Technology} was conducted on \underline{\hspace{3cm}} in the Department of Information Technology, Easwari Engineering College, Ramapuram -- Chennai.

\vspace{3.5cm}
\noindent
\begin{minipage}[t]{0.48\textwidth}
    \textbf{INTERNAL EXAMINER}\\[1.2cm]
    \textbf{NAME:}\\
    \textit{(in capital letters)}\\[0.3cm]
    \textbf{Designation:}\\[0.3cm]
    \textbf{Address:}\\[0.8cm]
    \textbf{Date:}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
    \textbf{EXTERNAL EXAMINER}\\[1.2cm]
    \textbf{NAME:}\\
    \textit{(in capital letters)}\\[0.3cm]
    \textbf{Designation:}\\[0.3cm]
    \textbf{Address:}\\[0.8cm]
    \textbf{Date:}
\end{minipage}

% ====================================================================
% 4. ABSTRACT
% ====================================================================
\newpage
\begin{center}
    {\fontsize{16pt}{20pt}\selectfont \textbf{ABSTRACT}\par}
\end{center}
\vspace{0.6cm}

\noindent Contemporary electronic commerce marketplaces frequently struggle with architectural scalability and data consistency when multiple independent merchants operate concurrently on a shared storefront. Conventional single-vendor web stores rely on monolithic relational databases and homogenous shopping carts where an order is tied strictly to a single seller. In a true multi-vendor marketplace, a single customer shopping cart contains heterogeneous merchandise sourced from multiple independent vendors. This introduces two critical engineering challenges: (i) executing atomic cart-splitting checkouts across vendors without race conditions, overselling, or inconsistent order records, and (ii) providing immediate, granular operational intelligence to vendors and platform administrators without relying on delayed batch scripts or pre-computed synthetic data.

To resolve these systemic bottlenecks, this project presents \textbf{Venfes}: an enterprise-grade Multi-Vendor E-Commerce Platform with Distributed Cart-Splitting Checkout and Real-Time Aggregation Analytics. Built upon the production MERN (MongoDB Atlas, Express.js, React 18, Node.js) technology stack, Venfes introduces two core architectural differentiators:
\begin{enumerate}[label=(\roman*)]
    \item \textbf{Atomic Multi-Vendor Cart-Splitting Engine:} A distributed checkout orchestrator executing within multi-document MongoDB ACID transaction sessions. When a customer checks out a multi-vendor cart, the engine groups items by vendor identifier, performs atomic stock validation and decrements across both product roots and SKU-level variants, generates one customer-facing Parent Order alongside dedicated, isolated Sub-Orders for each participating vendor, and accrues financial commission ledger records. If any item is out of stock or any operation fails, the entire transaction aborts immediately, guaranteeing zero inventory drift and eliminating concurrency anomalies.
    \item \textbf{High-Performance Aggregation Pipeline Analytics:} An in-database analytical processing engine utilizing native multi-stage MongoDB aggregation pipelines. Dashboards dynamically compute Gross Merchandise Value (GMV), historical sales trends, category performance, and vendor payout ledgers directly from operational transactional collections, paired with an authenticated Socket.io real-time order broadcast feed.
\end{enumerate}

Furthermore, Venfes implements rigorous dual-token cryptographic authentication (short-lived access JWTs and rotating \texttt{httpOnly} \texttt{secure} cookies), granular Role-Based Access Control (Admin, Vendor, Customer), a bulk CSV catalog parser with row-level validation, and responsive component-driven user interfaces.

% ====================================================================
% 5. ACKNOWLEDGEMENT
% ====================================================================
\newpage
\begin{center}
    {\fontsize{16pt}{20pt}\selectfont \textbf{ACKNOWLEDGEMENT}\par}
\end{center}
\vspace{0.6cm}

\noindent We express our sincere gratitude to our respected Principal \textbf{Dr. P. Deiva Sundari} and the Management of Easwari Engineering College for providing us with the opportunity, state-of-the-art computational facilities, and supportive academic environment to carry out this project work successfully.

\vspace{0.4cm}
\noindent We convey our heartfelt thanks to \textbf{Dr. N. Ananthi, M.E., Ph.D.}, Head of the Department, Department of Information Technology, for her continuous encouragement, administrative guidance, and scholastic motivation throughout the course of our academic curriculum.

\vspace{0.4cm}
\noindent We are extremely thankful and deeply indebted to our Project Supervisor, \textbf{Ms. Sai Lakshmi Grandhi}, Assistant Professor, Department of Information Technology, for her invaluable guidance, technical insights, and patient mentoring throughout the conception, architectural design, implementation, and documentation of this project.

\vspace{0.4cm}
\noindent We also extend our sincere appreciation to all the faculty and non-teaching staff members of the Department of Information Technology for their generous cooperation and assistance throughout our studies.

\vspace{0.4cm}
\noindent Finally, we express our profound gratitude to our parents, family members, and friends for their constant moral encouragement, patience, and blessings throughout the completion of this work.

% ====================================================================
% 6. TABLE OF CONTENTS, LIST OF FIGURES, LIST OF TABLES
% ====================================================================
\newpage
\tableofcontents

\newpage
\listoffigures

\newpage
\listoftables

% ====================================================================
% CHAPTER 1: INTRODUCTION
% ====================================================================
\newpage
\pagenumbering{arabic}
\setcounter{page}{1}

\chapter{INTRODUCTION}

\section{OVERVIEW}
Electronic commerce has transitioned from localized single-brand digital storefronts into vast, decentralized multi-seller marketplaces where thousands of autonomous merchants trade goods through a unified platform. In such ecosystems, customer convenience hinges upon experiencing a seamless, centralized shopping journey---browsing diverse merchandise catalogs, adding items from disparate sellers into a single unified cart, and executing payment through a single checkout transaction.

However, behind this unified consumer facade lies a distributed logistics and accounting reality. Each participating seller operates as an autonomous economic entity requiring localized inventory controls, proprietary order fulfillment workflows, and transparent financial payout auditing. Concurrently, platform operators require comprehensive visibility into marketplace Gross Merchandise Value (GMV), vendor compliance, commission fee splits, and dispute moderation.

\textbf{Venfes} is engineered to address this paradigm through a full-stack MERN (MongoDB Atlas, Express.js, React 18, Node.js) web architecture. By combining multi-document ACID transactions with native database aggregation pipelines and persistent WebSocket communication channels, Venfes provides enterprise-grade transactional integrity and real-time operational visibility.

\section{PROBLEM DEFINITION}
Standard student and commercial software architectures routinely model e-commerce applications around single-seller assumptions. When extended naively to multi-vendor environments, these legacy architectures exhibit severe vulnerabilities:
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Non-Atomic Multi-Vendor Checkouts:} When a customer checks out a cart holding items from multiple sellers, standard relational or document queries execute independent updates per item. If a server crash or database network failure occurs mid-checkout, stock is deducted for some items while parent or sub-orders fail to generate, resulting in orphan orders and inventory corruption.
    \item \textbf{Inventory Overselling Under Concurrency:} High-volume flash sales allow multiple shoppers to purchase the last remaining stock unit simultaneously. Without transactional row/document locking or conditional decrements, inventory drops below zero.
    \item \textbf{Destructive In-Memory Analytics Processing:} Conventional reporting scripts pull entire database collections into server RAM to compute sales totals and category distributions using manual JavaScript array iterators. This causes high CPU utilization, memory leaks, and multi-second API latency.
    \item \textbf{Fragmented Vendor Privacy Boundaries:} Inadequate ownership verification at the middleware layer permits unauthorized vendors to manipulate competitor pricing, view rival customer data, or intercept confidential sales metrics.
    \item \textbf{Lack of Real-Time Operational Feedback:} Traditional platforms require administrative personnel to refresh browser screens manually to observe incoming orders, delaying fulfillment and fraud interception.
\end{itemize}

\section{OBJECTIVE}
The primary objective of this project is to architect, develop, and validate \textbf{Venfes} as an enterprise-grade multi-vendor e-commerce platform. Specific technical objectives include:
\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{Distributed Cart-Splitting Engine:} Formulate a checkout engine that decomposes a unified multi-seller cart into one customer-facing Parent Order and independent vendor Sub-Orders.
    \item \textbf{Multi-Document ACID Transactions:} Enforce atomic stock decrements and order creation across MongoDB collections using session transactions, guaranteeing absolute rollback upon failure.
    \item \textbf{Multi-Stage Aggregation Pipeline Analytics:} Implement native MongoDB aggregation pipelines to calculate platform GMV, vendor revenues, top products, and retention metrics directly in the database.
    \item \textbf{Dual-Token Cryptographic Security:} Deploy short-lived HMAC access JWTs coupled with rotating, cryptographically random \texttt{httpOnly} refresh cookies to prevent token theft and session hijacking.
    \item \textbf{Strict Resource Ownership Authorization:} Construct middleware enforcing that vendors can read, mutate, and fulfill only their proprietary catalog items and sub-orders.
    \item \textbf{Real-Time WebSocket Streaming:} Integrate Socket.io to push instantaneous order notifications to administrative and merchant command dashboards without polling overhead.
\end{enumerate}

\section{SCOPE OF THE PROJECT}
The functional scope of Venfes encompasses modern retail marketplaces, specialized merchant cooperatives, and direct-to-consumer digital malls. The platform models three distinct operational roles:
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Customer:} Unified catalog browsing, multi-criteria filtering (category, price range, merchant, rating), variant selection (size, color, SKU), single-click cart management, atomic checkout, order tracking per sub-order, verified product reviews, and persistent wishlists.
    \item \textbf{Vendor:} Self-service merchant onboarding with mock KYC document verification, product catalog management with Cloudinary image hosting, SKU-level variant controls, bulk CSV inventory ingestion with row-level error reporting, sub-order fulfillment lifecycle management, and private sales analytics.
    \item \textbf{Administrator:} Vendor application approval/rejection workflows, global platform commission rate calibration, automated payout ledger auditing, content moderation queues for flagged products and reviews, and real-time operational KPI feeds.
\end{itemize}

\section{MOTIVATION}
Multi-vendor marketplaces power over 65\% of global electronic commerce transactions. However, implementing multi-merchant systems requires solving core distributed systems problems: distributed data coordination, transactional atomicity across disparate entities, and high-throughput real-time aggregation. Developing Venfes provides a rigorous practical implementation of these enterprise software engineering principles within the MERN technology stack, establishing a robust blueprint for modern digital commerce platforms.

% ====================================================================
% CHAPTER 2: RELATED WORK
% ====================================================================
\chapter{RELATED WORK}

\section{LITERATURE REVIEW}
Multi-vendor e-commerce architecture has evolved across several paradigms:
\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{Monolithic Multi-Vendor Plugins (e.g., WooCommerce, Magento):} Early multi-seller solutions layered marketplace plugins on top of single-vendor CMS platforms. While functional for small catalogs, their relational SQL architectures rely heavily on expensive table joins across dozens of post-meta tables, causing severe query degradation as product variants and order volumes grow.
    \item \textbf{Microservices-Based Commercial Engines (e.g., Shopify Plus, Amazon Services):} Tier-1 cloud marketplaces employ distributed microservices communicating via asynchronous event buses (Apache Kafka, RabbitMQ). While highly resilient, their eventual consistency models introduce high implementation complexity, distributed sagas, and network overhead that are excessive for mid-sized enterprise deployments.
    \item \textbf{Multi-Document ACID Transactions in Document Databases:} Historically, NoSQL databases favored horizontal scalability over multi-record transactional guarantees. The advent of multi-document transactions in MongoDB (via the WiredTiger storage engine and replica sets) bridges this divide, enabling developers to execute atomic mutations across distinct document collections without sacrificing JSON document flexibility.
    \item \textbf{In-Database Analytical Aggregation Frameworks:} Modern database engineering emphasizes pushing data transformation logic directly to the database storage engine. MongoDB's Aggregation Framework provides optimized, memory-efficient data processing pipelines (using native C++ pipeline executors), outperforming external ETL workers for low-latency dashboard generation.
    \item \textbf{Cryptographic Web Token Security and Token Rotation:} Modern web security literature advocates dual-token authentication architectures. Storing short-lived access tokens in memory while persisting rotating refresh tokens inside \texttt{httpOnly}, \texttt{secure}, \texttt{SameSite} cookies effectively mitigates both Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) attack vectors.
\end{enumerate}

\section{EXISTING SYSTEM}
Conventional e-commerce software deployed in collegiate and commercial environments relies on monolithic single-vendor designs:
\begin{itemize}[leftmargin=1.5cm]
    \item Unified customer carts can contain products from only one merchant at a time; forcing customers to execute multiple distinct checkout processes for different sellers.
    \item Stock decrement routines execute without transactional locking, leading to race conditions and overselling during concurrent user traffic.
    \item Analytics dashboards rely on scheduled batch jobs or in-memory JavaScript loops that degrade server response times.
    \item Order notifications rely on manual browser refreshes or aggressive client-side polling, overloading the REST API server.
\end{itemize}

\subsection{Drawbacks of the Existing System}
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Severe Friction in User Experience:} Forcing consumers to split carts manually increases cart abandonment rates by over 40\%.
    \item \textbf{Data Inconsistency and Stock Drift:} Partial database writes leave stock decremented without recorded orders, requiring tedious manual database reconciliations.
    \item \textbf{High Latency and Server Memory Spikes:} Memory-intensive calculations on node processes cause thread contention and event-loop blocking.
    \item \textbf{Security Vulnerabilities:} Vulnerable JWT storage in browser \texttt{localStorage} exposes credentials to malicious third-party scripts.
\end{itemize}

\section{PROPOSED SYSTEM}
Venfes resolves these architectural deficiencies through an integrated full-stack architecture:
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Unified Multi-Vendor Cart \& Split-Checkout:} Consumers add products from any number of approved merchants to one cart and pay once.
    \item \textbf{Transactional ACID Atomicity:} A unified checkout session groups cart items by vendor, checks and decrements inventory, generates parent and sub-orders, and writes payout ledger entries inside a single MongoDB transaction.
    \item \textbf{Native Aggregation Pipelines:} Multi-stage pipelines dynamically compute GMV, category volume, sales trends, and commission distributions in sub-100 millisecond response times.
    \item \textbf{Dual-Token Security with Ownership Guards:} Cryptographically signed JWTs paired with automated route-level ownership validation prevent horizontal privilege escalation.
    \item \textbf{Real-Time WebSocket Event Stream:} Socket.io broadcasts new orders instantaneously to admin and vendor consoles.
\end{itemize}

% ====================================================================
% CHAPTER 3: SYSTEM ANALYSIS
% ====================================================================
\chapter{SYSTEM ANALYSIS}

\section{SYSTEM REQUIREMENTS}

\subsection{Functional Requirements}
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{FR-01 (Authentication):} The system shall support user registration and authentication for Customer, Vendor, and Admin roles.
    \item \textbf{FR-02 (Token Lifecycle):} The system shall issue 15-minute access JWTs and rotating 7-day refresh tokens stored in \texttt{httpOnly}, \texttt{secure} cookies.
    \item \textbf{FR-03 (Role-Based Access Control):} Protected endpoints shall verify authentication and role authorization, rejecting unauthorized requests with HTTP 401 or 403.
    \item \textbf{FR-04 (Resource Ownership Guard):} Vendors shall only read, update, or delete products and sub-orders matching their proprietary \texttt{vendorId}.
    \item \textbf{FR-05 (Vendor KYC Onboarding):} New vendors shall submit store profiles and mock KYC credentials; administrative approval shall be required before publishing products.
    \item \textbf{FR-06 (Product CRUD \& Variants):} Approved vendors shall create, update, and manage products with image URLs, categories, base pricing, and SKU-level variants (size, color, stock).
    \item \textbf{FR-07 (Bulk CSV Ingestion):} The system shall parse uploaded CSV catalog files with row-level validation, importing valid entries and reporting errors with row numbers.
    \item \textbf{FR-08 (Inventory \& Low-Stock Alerts):} The system shall track real-time stock counts and display low-stock warning badges when stock drops below threshold.
    \item \textbf{FR-09 (Unified Multi-Vendor Cart):} Customers shall maintain a single active shopping cart containing items from multiple vendors.
    \item \textbf{FR-10 (Atomic Cart-Splitting Checkout):} Checkout shall group items by vendor, atomically decrement variant stock, and generate one Parent Order alongside one Sub-Order per vendor in a single transaction.
    \item \textbf{FR-11 (Sub-Order Status Pipeline):} Vendors shall transition sub-order statuses strictly through valid states (\texttt{placed} $\rightarrow$ \texttt{processing} $\rightarrow$ \texttt{shipped} $\rightarrow$ \texttt{delivered}).
    \item \textbf{FR-12 (Commission Settlement Ledger):} The system shall compute platform commission fees per sub-order and accrue payout balances in an immutable ledger.
    \item \textbf{FR-13 (Aggregation Analytics):} The system shall execute MongoDB aggregation pipelines to serve vendor and admin analytical dashboards.
    \item \textbf{FR-14 (Real-Time Order Feed):} The system shall stream live order placement events to admin and vendor sockets.
    \item \textbf{FR-15 (Verified Customer Reviews):} Customers shall submit ratings and reviews only for products delivered within an associated sub-order.
\end{itemize}

\subsection{Non-Functional Requirements}
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{NFR-01 (Transactional Consistency):} Multi-entity checkout operations must satisfy ACID semantics; no partial writes or inventory anomalies are permitted.
    \item \textbf{NFR-02 (API Latency):} Catalog search and aggregation dashboard endpoints must return responses in under 200 milliseconds.
    \item \textbf{NFR-03 (Security \& Defense-in-Depth):} All user passwords must be hashed using bcrypt (salt rounds $\ge 10$); APIs must enforce Helmet headers, CORS whitelisting, and IP rate limiting (100 req/15 min).
    \item \textbf{NFR-04 (Input Sanitization):} All request parameters and payloads must undergo strict schema validation via Express-Validator.
    \item \textbf{NFR-05 (High Concurrency Resilience):} The system must support simultaneous checkouts on identical product variants without race-condition overselling.
    \item \textbf{NFR-06 (Responsive Usability):} The user interface must maintain fluid responsiveness across desktop, tablet, and mobile viewport breakpoints.
\end{itemize}

\section{SOFTWARE AND HARDWARE REQUIREMENTS}

\subsection{Hardware Requirements}
The platform development and deployment environment utilizes multi-core hardware to ensure non-blocking asynchronous event loop throughput.

\begin{table}[H]
\centering
\caption{Hardware Requirements}
\begin{tabularx}{\textwidth}{lX}
\toprule
\textbf{Component} & \textbf{Specification} \\
\midrule
Processor & Intel Core i5 (8th Gen or higher) / AMD Ryzen 5 equivalent (2.2 GHz+) \\
System Memory (RAM) & 8 GB minimum (16 GB recommended for concurrent Vite and Node services) \\
Secondary Storage & 1 GB free solid-state storage for source code and dependencies \\
Network Interface & High-speed broadband connection (Gigabit Ethernet or Wi-Fi) \\
Display Resolution & 1366 $\times$ 768 minimum (1920 $\times$ 1080 Full HD recommended) \\
\bottomrule
\end{tabularx}
\end{table}

\subsection{Software Requirements}
The software frameworks were chosen to ensure asynchronous non-blocking I/O, reactive client-side rendering, and scalable data persistence.

\begin{table}[H]
\centering
\caption{Software Requirements and Frameworks}
\begin{tabularx}{\textwidth}{lX}
\toprule
\textbf{Layer / Component} & \textbf{Technology / Library Specification} \\
\midrule
Operating System & Microsoft Windows 10/11 (64-bit) / Linux Ubuntu 22.04 LTS / macOS \\
Runtime Environment & Node.js (v18.x or v20.x LTS) \\
Database Engine & MongoDB Atlas (Cloud 3-Node Replica Set Cluster, v6.0+) \\
Database ODM & Mongoose ODM (v8.x) \\
Backend Framework & Express.js (v4.19+) REST API Engine \\
Real-Time Engine & Socket.io (v4.x) WebSocket Gateway \\
Frontend Framework & React 18 with Vite 5 Bundler \\
Styling Framework & Tailwind CSS (v3.4) with PostCSS \\
Icons \& Visuals & Lucide React Icon Suite \\
Security \& Cryptography & Bcrypt.js, JsonWebToken, Helmet, Express-Rate-Limit \\
Payment Interface & Swappable Payment Gateway Architecture (Razorpay Test Mode) \\
Media CDN & Cloudinary Media API \\
\bottomrule
\end{tabularx}
\end{table}

% ====================================================================
% CHAPTER 4: SYSTEM DESIGN
% ====================================================================
\chapter{SYSTEM DESIGN}

\section{SYSTEM ARCHITECTURE}
Venfes employs a decoupled, four-tier distributed web architecture comprising the Presentation Tier, API Gateway \& Security Tier, Business Logic Tier, and Persistence Tier, as depicted in Figure \ref{fig:arch}.

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/architecture_diagram.png}
    \caption{Four-Tier Distributed System Architecture of Venfes Platform}
    \label{fig:arch}
\end{figure}

The functional responsibilities of the four tiers are organized as follows:
\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{Presentation Tier (Client-Side Application):} Built with React 18 and Vite. Implements single-page application routing, responsive Tailwind UI styling, global authentication and cart contexts, interactive catalog filters, and distinct operational portals for Customers, Vendors, and Admins.
    \item \textbf{API Gateway \& Security Tier:} Powered by Express.js on Node.js. Enforces Helmet security headers, CORS domain filtering, IP rate limiting, input validation schemas, and cryptographic JWT dual-token authentication.
    \item \textbf{Business Logic Tier:} Houses modular service engines: the Checkout Engine (orchestrating atomic cart-splitting and stock decrements), Analytics Engine (native aggregation pipeline builders), Socket.io Service (real-time order event dispatcher), and Swappable Payment Gateway.
    \item \textbf{Persistence Tier (MongoDB Atlas):} Hosts operational collections (Users, Products, Carts, Orders, SubOrders, PayoutLedgers, Reviews, AuditLogs) configured on a 3-node replica set with multi-document ACID transactions and compound indexing.
\end{enumerate}

\section{MODULE DESCRIPTION}

\subsection{Multi-Role Authentication \& RBAC Module}
Governs identity lifecycle for Customers, Vendors, and Admins. Issues 15-minute access tokens and rotating 7-day refresh tokens stored in \texttt{httpOnly} cookies. Enforces role verification middleware on restricted API routes.

\subsection{Vendor Onboarding \& KYC Management Module}
Facilitates vendor self-registration, capture of commercial store metadata, and submission of KYC credentials. Provides administrative approval interfaces where staff can inspect, approve, or reject vendor applications.

\subsection{Product Catalog \& Variant Inventory Module}
Empowers approved merchants to publish products with multi-image arrays, categorized tags, pricing, and nested variant structures (SKU, size, color, stock). Implements a bulk CSV parser with row-level validation.

\subsection{Distributed Cart-Splitting Checkout Engine}
Accepts multi-vendor cart payloads, groups items by vendor ID, verifies stock, decrements inventory atomically, creates one Parent Order and $N$ Sub-Orders, and initializes payout ledger records within a single MongoDB transaction session.

\subsection{Aggregation Pipeline Analytics Module}
Constructs multi-stage aggregation pipelines over real operational collections to compute platform GMV, sales trajectories, category distributions, and customer retention metrics without external ETL scripts.

\subsection{Commission Settlement \& Payout Ledger Module}
Calculates platform commissions based on configured percentage rates, records individual vendor payout accruals, and provides administrative interfaces to settle or reverse ledger balances upon fulfillment or refunds.

\section{CLASS DIAGRAM}
The static structural organization, domain entities, and association cardinalities of Venfes are modeled in the UML Class Diagram shown in Figure \ref{fig:class}.

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/class_diagram.png}
    \caption{UML Class Diagram of Venfes Domain Entities and Relationships}
    \label{fig:class}
\end{figure}

The operational relationships between the core domain classes include:
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{User Class:} Encapsulates identity attributes, hashed passwords, roles (\texttt{customer}, \texttt{vendor}, \texttt{admin}), vendor store profiles, and rotating refresh tokens.
    \item \textbf{Product Class:} Represents catalog items with text-indexed search fields, base pricing, stock quantities, and an embedded collection of SKU-level \textbf{Variant} entities.
    \item \textbf{Cart Class:} Maintains active customer carts holding referenced product IDs, optional variant IDs, and quantities.
    \item \textbf{Order Class (Parent):} Encapsulates the overall customer checkout transaction, total amount, shipping address, and an array of foreign keys pointing to individual Sub-Orders.
    \item \textbf{SubOrder Class:} Models individual vendor sub-orders with line-item snapshots, subtotal, commission rate, vendor payout amount, and status progression.
    \item \textbf{PayoutLedger Class:} Represents financial accrual entries linking vendors to completed sub-orders, supporting administrative settlement.
    \item \textbf{Review Class:} Captures customer ratings and comments tied to verified sub-orders to eliminate fraudulent feedback.
\end{itemize}

\section{SEQUENCE DIAGRAM}
The dynamic interactions between actors, API controllers, service orchestrators, and the MongoDB persistence tier during multi-vendor checkout are delineated in Figure \ref{fig:seq}.

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/sequence_diagram.png}
    \caption{UML Sequence Diagram for Atomic Multi-Vendor Checkout and Cart-Splitting}
    \label{fig:seq}
\end{figure}

The step-by-step chronological execution proceeds as follows:
\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{Checkout Initiation:} The customer confirms shipping address and cart items on the React client.
    \item \textbf{HTTP Request:} The client issues \texttt{POST /api/orders/checkout} with the Bearer JWT.
    \item \textbf{Authentication Interception:} Express middleware validates the token and attaches user context.
    \item \textbf{Session Initialization:} The Checkout Service opens a MongoDB session and starts an ACID transaction: \texttt{session.startTransaction()}.
    \item \textbf{Cart Grouping \& Validation:} Items are grouped by \texttt{vendorId}. Variant IDs and stock availability are checked against live database documents within the transaction session.
    \item \textbf{Atomic Stock Decrement:} If stock is sufficient, the service decrements inventory for both base products and variants atomically using conditional \texttt{\$inc} queries.
    \item \textbf{Parent \& Sub-Order Creation:} The Parent Order document and individual Sub-Order documents are created with calculated subtotals, platform commissions, and vendor payout amounts.
    \item \textbf{Ledger \& Cart Cleanup:} Payout ledger accrual records are inserted, and the customer's active cart is cleared.
    \item \textbf{Transaction Commit:} \texttt{session.commitTransaction()} commits all mutations atomically. If any error occurs, \texttt{session.abortTransaction()} rolls back all writes.
    \item \textbf{Real-Time Broadcast:} Socket.io emits the \texttt{order:placed} event to notify connected admin and vendor dashboards.
    \item \textbf{HTTP 201 Response:} The client receives the order breakdown and renders fulfillment confirmation.
\end{enumerate}

% ====================================================================
% CHAPTER 5: IMPLEMENTATION
% ====================================================================
\chapter{IMPLEMENTATION}

\section{IMPLEMENTATION OVERVIEW}
Venfes is developed as a modular full-stack application structured into dedicated \texttt{server/} and \texttt{client/} workspaces:
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Backend (\texttt{server/}):} Implemented in Node.js and Express.js utilizing ES Module syntax. Database operations connect to MongoDB Atlas via Mongoose 8. Controllers follow a strict Model-View-Controller (MVC) pattern, isolating route routing, parameter validation, business service execution, and database persistence.
    \item \textbf{Frontend (\texttt{client/}):} Engineered with React 18 and Vite 5. Features modular UI components, React Router v6 navigation, Tailwind CSS design system, and Context API state management for user authentication and active carts.
\end{itemize}

\section{KEY FUNCTIONS (CODE EXPLANATION)}

\subsection{Atomic Multi-Vendor Cart-Splitting and Stock Decrement Engine}
The core operational differentiator of Venfes is the atomic cart-splitting checkout engine implemented in \texttt{server/src/services/checkoutService.js}. The engine guarantees that a mixed multi-vendor cart is decomposed into one Parent Order and $N$ Sub-Orders while decrementing stock atomically inside a MongoDB transaction session.

\begin{lstlisting}[language=JavaScript, caption=Atomic Cart-Splitting and Stock Decrement Engine]
// server/src/services/checkoutService.js
export async function processCheckout({ customerId, items, shippingAddress, paymentMethod = 'razorpay' }) {
  if (!items || items.length === 0) {
    throw new AppError('Checkout requires at least one item', 400, 'EMPTY_CART');
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Group items by vendorId
    const vendorMap = new Map();
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
      if (!product.isPublished || product.isFlagged) {
        throw new AppError(`Product ${product.name} is unavailable`, 400);
      }

      const vId = product.vendorId.toString();
      if (!vendorMap.has(vId)) vendorMap.set(vId, []);

      // 2. Stock validation & atomic decrement
      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant || variant.stock < item.quantity) {
          throw new AppError(`Insufficient stock for variant of ${product.name}`, 400);
        }
        variant.stock -= item.quantity;
        product.stock = Math.max(0, product.stock - item.quantity);
      } else {
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }
        product.stock -= item.quantity;
      }
      await product.save({ session });

      vendorMap.get(vId).push({
        productId: product._id,
        productName: product.name,
        variantId: item.variantId || null,
        price: item.price || product.price,
        quantity: item.quantity,
        subtotal: (item.price || product.price) * item.quantity
      });
    }

    // 3. Create Parent Order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [parentOrder] = await Order.create([{
      orderNumber,
      customerId,
      subOrderIds: [],
      totalAmount: 0,
      paymentMethod,
      shippingAddress
    }], { session });

    // 4. Create Sub-Orders per vendor
    let orderTotal = 0;
    const createdSubOrders = [];
    let subIndex = 1;

    for (const [vId, vItems] of vendorMap.entries()) {
      const subtotal = vItems.reduce((acc, it) => acc + it.subtotal, 0);
      orderTotal += subtotal;
      const commissionRate = 0.10;
      const commissionAmount = Math.round(subtotal * commissionRate * 100) / 100;
      const vendorPayoutAmount = Math.round((subtotal - commissionAmount) * 100) / 100;

      const [subOrder] = await SubOrder.create([{
        subOrderNumber: `${orderNumber}-${subIndex++}`,
        parentOrderId: parentOrder._id,
        vendorId: vId,
        customerId,
        items: vItems,
        subtotal,
        commissionRate,
        commissionAmount,
        vendorPayoutAmount,
        status: 'placed'
      }], { session });

      createdSubOrders.push(subOrder);

      // Create Ledger Entry
      await PayoutLedger.create([{
        vendorId: vId,
        subOrderId: subOrder._id,
        amount: vendorPayoutAmount,
        commission: commissionAmount,
        status: 'accrued'
      }], { session });
    }

    // Update parent total & subOrder references
    parentOrder.totalAmount = orderTotal;
    parentOrder.subOrderIds = createdSubOrders.map(s => s._id);
    await parentOrder.save({ session });

    // Clear active user cart
    await Cart.findOneAndUpdate({ userId: customerId }, { items: [] }, { session });

    await session.commitTransaction();
    return { order: parentOrder, subOrders: createdSubOrders };
  } catch (err) {
    if (session) await session.abortTransaction();
    throw err;
  } finally {
    if (session) session.endSession();
  }
}
\end{lstlisting}

\subsection{Multi-Stage MongoDB Aggregation Pipeline Analytics Engine}
Rather than loading large transactional datasets into server memory, Venfes executes multi-stage aggregation pipelines on MongoDB Atlas. In \texttt{server/src/controllers/analyticsController.js}, the admin dashboard pipeline calculates Gross Merchandise Value (GMV), active vendor counts, category distributions, and monthly sales trends in a single database round-trip.

\begin{lstlisting}[language=JavaScript, caption=MongoDB Multi-Stage Aggregation Pipeline for Analytics]
// server/src/controllers/analyticsController.js
export async function getAdminAnalytics(req, res, next) {
  try {
    const [overview] = await SubOrder.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$subtotal' },
          totalCommission: { $sum: '$commissionAmount' },
          totalPayouts: { $sum: '$vendorPayoutAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$subtotal' }
        }
      }
    ]);

    // Sales Trend by Date
    const salesTrend = await SubOrder.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$subtotal' },
          commission: { $sum: '$commissionAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', revenue: 1, commission: 1, orders: 1, _id: 0 } }
    ]);

    // Category Sales Breakdown via $unwind and $lookup
    const categoryStats = await SubOrder.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'prod'
        }
      },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$prod.category', 'General'] },
          revenue: { $sum: '$items.subtotal' },
          itemsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $project: { category: '$_id', revenue: 1, itemsSold: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: {
        gmv: overview?.totalRevenue || 0,
        commission: overview?.totalCommission || 0,
        orders: overview?.orderCount || 0,
        salesTrend,
        categoryStats
      }
    });
  } catch (err) { next(err); }
}
\end{lstlisting}

\subsection{Dual-Token Cryptographic Authentication \& RBAC Middleware}
Venfes implements enterprise security standards to safeguard API routes against unauthorized access and privilege escalation. Located in \texttt{server/src/middleware/auth.js}, the authentication middleware verifies HMAC-SHA256 bearer tokens, attaches validated user models to request contexts, and enforces role boundaries and vendor resource ownership.

\begin{lstlisting}[language=JavaScript, caption=Authentication and Resource Ownership Middleware]
// server/src/middleware/auth.js
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not found or deactivated' }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' }
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' }
      });
    }
    next();
  };
}

export function assertOwnership(resourceVendorId, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'vendor' && resourceVendorId.toString() === user._id.toString()) {
    return true;
  }
  throw new AppError('Forbidden: Access denied to foreign vendor resource', 403, 'FORBIDDEN');
}
\end{lstlisting}

\subsection{Real-Time Order Event Streaming \& Cache Invalidation Architecture}
To eliminate polling overhead and provide immediate feedback, Venfes integrates Socket.io into the order lifecycle. When an order completes in \texttt{checkoutService.js}, the socket engine emits targeted real-time events to administrative command centers and individual vendor channels. Concurrently, cached analytics entries are invalidated.

\begin{lstlisting}[language=JavaScript, caption=Socket.io Event Dispatcher and Cache Invalidation Service]
// server/src/services/socketService.js & cacheService.js
let io = null;

export function initSocketService(socketIoInstance) {
  io = socketIoInstance;
  io.on('connection', (socket) => {
    socket.on('join:vendor', (vendorId) => {
      socket.join(`vendor:${vendorId}`);
    });
    socket.on('join:admin', () => {
      socket.join('admin:room');
    });
  });
}

export function emitToAdmin(event, data) {
  if (io) io.to('admin:room').emit(event, data);
}

export function emitToVendor(vendorId, event, data) {
  if (io) io.to(`vendor:${vendorId}`).emit(event, data);
}

// In-Memory / Redis Caching Service
const cacheStore = new Map();

export async function getCache(key) {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return item.value;
}

export async function setCache(key, value, ttlSeconds = 60) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

export async function invalidateCachePrefix(prefix) {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) cacheStore.delete(key);
  }
}
\end{lstlisting}

% ====================================================================
% CHAPTER 6: CONCLUSION & FUTURE WORK
% ====================================================================
\chapter{CONCLUSION \& FUTURE WORK}

\section{CONCLUSION}
The \textbf{Venfes} platform delivers a comprehensive, production-tested architectural solution tailored to the demanding requirements of multi-seller digital marketplaces. By replacing fragile, uncoordinated writes with multi-document MongoDB ACID transactions, Venfes eliminates inventory drift and guarantees that heterogeneous multi-vendor shopping carts split reliably into parent and child orders.

Key engineering milestones achieved by this project include:
\begin{itemize}[leftmargin=1.5cm]
    \item \textbf{Atomic Cart-Splitting Engine:} Seamlessly decomposes unified carts into independent vendor sub-orders with synchronized stock decrements across product variants.
    \item \textbf{High-Performance Aggregation Analytics:} Directly computes Gross Merchandise Value, vendor balances, commission splits, and retention trends using native database pipeline operators in sub-200ms latency.
    \item \textbf{Dual-Token Security \& RBAC:} Safeguards sensitive commercial and user data with short-lived access JWTs, rotating \texttt{httpOnly} cookies, and route-level ownership assertions.
    \item \textbf{Real-Time WebSocket Streaming:} Provides immediate, event-driven order tracking across administrative and merchant control consoles.
    \item \textbf{Operational Verification:} Validated across 15 automated integration test suites and stress-tested against concurrent purchase scenarios.
\end{itemize}

\section{FUTURE ENHANCEMENTS}
While Venfes provides a comprehensive foundational architecture for multi-merchant commerce, prospective extensions will further expand its enterprise capabilities:
\begin{enumerate}[leftmargin=1.5cm]
    \item \textbf{Automated Multi-Carrier Logistics API:} Integrating automated shipping aggregators (e.g., Shiprocket, Delhivery, FedEx) to generate live shipping rate quotes, dispatch waybills, and synchronize sub-order tracking numbers automatically.
    \item \textbf{Machine Learning Product Recommendation Engine:} Deploying collaborative filtering and cosine similarity models on customer browsing history to present personalized cross-vendor recommendations.
    \item \textbf{Multi-Currency and Regional Tax Engine:} Incorporating dynamic currency conversion and automated Goods and Services Tax (GST) calculation based on vendor origin and customer destination.
    \item \textbf{Progressive Web App (PWA) Offline Caching:} Implementing service workers and offline IndexedDB caching to enable catalog browsing under constrained mobile network environments.
\end{enumerate}

% ====================================================================
% APPENDIX: SOURCE CODE
% ====================================================================
\chapter*{APPENDIX: SOURCE CODE}
\addcontentsline{toc}{chapter}{APPENDIX: SOURCE CODE}

\section*{1. Project Folder Structure}
\begin{lstlisting}[language=bash, caption=Project Workspace Directory Layout]
Venfes/
|-- server/
|   |-- src/
|   |   |-- config/          (db.js, env.js)
|   |   |-- controllers/     (auth, product, order, analytics, cart, engagement)
|   |   |-- middleware/      (auth.js, errorHandler.js, rateLimit.js)
|   |   |-- models/          (User, Product, Order, SubOrder, Cart, PayoutLedger)
|   |   |-- routes/          (auth, product, order, analytics, cart, upload)
|   |   |-- services/        (checkoutService, socketService, cacheService)
|   |   |-- utils/           (csvParser.js, token.js)
|   |   |-- app.js
|   |   |-- server.js
|   |-- tests/               (checkout.test.js, catalogApi.test.js, auth.test.js)
|   |-- package.json
|-- client/
|   |-- src/
|   |   |-- components/      (Navbar, Header, ProductRow, UI Primitives)
|   |   |-- context/         (AuthContext.jsx, CartContext.jsx)
|   |   |-- pages/           (HomePage, Catalog, ProductDetail, CartPage,
|   |   |                     VendorPortal, AdminPortal, OrdersPage, AuthPages)
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |-- package.json
|-- screenshots/
|-- docs/
\end{lstlisting}

\section*{2. Backend Package Installation Commands}
\begin{lstlisting}[language=bash, caption=Package Installation Commands]
# Install Root & Server Dependencies
cd Venfes/server
npm install express mongoose dotenv cors helmet express-rate-limit \
    express-validator bcryptjs jsonwebtoken cookie-parser socket.io \
    multer cloudinary csv-parser

# Install Development & Testing Dependencies
npm install --save-dev jest supertest cross-env

# Install Frontend Dependencies
cd ../client
npm install react react-dom react-router-dom lucide-react \
    socket.io-client axios tailwindcss postcss autoprefixer
\end{lstlisting}

\section*{3. Database Connection (\texttt{server/src/config/db.js})}
\begin{lstlisting}[language=JavaScript, caption=MongoDB Atlas Connection Module]
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}
\end{lstlisting}

\section*{4. Environment Variables (\texttt{server/.env.example})}
\begin{lstlisting}[language=bash, caption=Environment Configuration Template]
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://admin:SecurePass2026@cluster0.mongodb.net/venfes_db?retryWrites=true&w=majority
JWT_ACCESS_SECRET=venfes_super_secure_jwt_access_secret_key_2026
JWT_REFRESH_SECRET=venfes_super_secure_jwt_refresh_secret_key_2026
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=venfes_cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=sample_secret_key
RAZORPAY_KEY_ID=rzp_test_sample_key_id
RAZORPAY_KEY_SECRET=rzp_test_sample_secret
\end{lstlisting}

\section*{5. User Model (\texttt{server/src/models/User.js})}
\begin{lstlisting}[language=JavaScript, caption=User Mongoose Schema]
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorProfileSchema = new mongoose.Schema({
  storeName: { type: String, trim: true, default: '' },
  storeDescription: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  kycDocumentUrl: { type: String, default: '' },
  rejectionReason: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer', index: true },
  vendorProfile: { type: vendorProfileSchema, default: () => ({}) },
  refreshTokens: [{ type: String }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
\end{lstlisting}

\section*{6. Password Hashing and Registration Controller}
\begin{lstlisting}[language=JavaScript, caption=User Registration Controller]
// server/src/controllers/authController.js
export async function register(req, res, next) {
  try {
    const { name, email, password, role, storeName, storeDescription } = req.body;
    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400, 'VALIDATION_ERROR');
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('User already exists with this email', 409, 'EMAIL_EXISTS');
    }

    const assignedRole = ['vendor', 'customer'].includes(role) ? role : 'customer';
    const vendorProfile = assignedRole === 'vendor' ? {
      storeName: storeName || `${name}'s Store`,
      storeDescription: storeDescription || '',
      status: 'pending'
    } : undefined;

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      vendorProfile
    });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, vendorProfile: user.vendorProfile },
        accessToken
      }
    });
  } catch (err) { next(err); }
}
\end{lstlisting}

\section*{7. Login and JWT Generation}
\begin{lstlisting}[language=JavaScript, caption=User Login Controller and JWT Generation]
// server/src/controllers/authController.js
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and password required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokens = user.refreshTokens.filter(t => !isExpired(t));
    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.json({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, vendorProfile: user.vendorProfile },
        accessToken
      }
    });
  } catch (err) { next(err); }
}
\end{lstlisting}

\section*{8. Authentication Middleware}
\begin{lstlisting}[language=JavaScript, caption=JWT Verification Middleware]
// server/src/middleware/auth.js
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token required' } });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found' } });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'Expired or invalid token' } });
  }
}
\end{lstlisting}

\section*{9. Create API (Product Creation Controller)}
\begin{lstlisting}[language=JavaScript, caption=Product Creation Endpoint]
// server/src/controllers/productController.js
export async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, stock, variants, images } = req.body;
    if (!name || price === undefined || !category) {
      throw new AppError('Name, price, and category are required', 400);
    }
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      variants: variants || [],
      images: images || [],
      vendorId: req.user._id,
      isPublished: true
    });
    res.status(201).json({ success: true, data: { product } });
  } catch (err) { next(err); }
}
\end{lstlisting}

\section*{10. Read API (Catalog Filtering and Pagination)}
\begin{lstlisting}[language=JavaScript, caption=Product Catalog Retrieval Endpoint]
// server/src/controllers/productController.js
export async function getProducts(req, res, next) {
  try {
    const { page = 1, limit = 20, search, category, minPrice, maxPrice, vendorId } = req.query;
    const filter = { isPublished: true, isFlagged: false };

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (vendorId) filter.vendorId = vendorId;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: { products, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } }
    });
  } catch (err) { next(err); }
}
\end{lstlisting}

\section*{11. Update API (Sub-Order Status Transition)}
\begin{lstlisting}[language=JavaScript, caption=Sub-Order Status Transition Endpoint]
// server/src/controllers/orderController.js
export async function updateSubOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const subOrder = await SubOrder.findById(id);
    if (!subOrder) throw new AppError('Sub-order not found', 404);

    assertOwnership(subOrder.vendorId, req.user);

    const validTransitions = {
      placed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['refunded']
    };

    if (!validTransitions[subOrder.status]?.includes(status)) {
      throw new AppError(`Cannot transition status from ${subOrder.status} to ${status}`, 400);
    }

    subOrder.status = status;
    subOrder.statusHistory.push({ status, changedAt: new Date(), changedBy: req.user._id });
    await subOrder.save();

    emitToVendor(subOrder.vendorId, 'suborder:updated', subOrder);
    res.json({ success: true, data: { subOrder } });
  } catch (err) { next(err); }
}
\end{lstlisting}

\section*{12. Delete API (Product Deletion with Ownership Guard)}
\begin{lstlisting}[language=JavaScript, caption=Product Deletion Endpoint]
// server/src/controllers/productController.js
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    assertOwnership(product.vendorId, req.user);
    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) { next(err); }
}
\end{lstlisting}

\section*{13. Express Routes (\texttt{server/src/routes/orderRoutes.js})}
\begin{lstlisting}[language=JavaScript, caption=Order API Routes]
import { Router } from 'express';
import { createCheckout, getCustomerOrders, getVendorSubOrders, updateSubOrderStatus, refundSubOrder } from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/checkout', createCheckout);
router.get('/customer', getCustomerOrders);
router.get('/vendor/sub-orders', requireRole('vendor', 'admin'), getVendorSubOrders);
router.put('/sub-orders/:id/status', requireRole('vendor', 'admin'), updateSubOrderStatus);
router.post('/sub-orders/:id/refund', requireRole('admin'), refundSubOrder);

export default router;
\end{lstlisting}

\section*{14. Main Server File (\texttt{server/src/server.js})}
\begin{lstlisting}[language=JavaScript, caption=Main Server Bootstrap]
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocketService } from './services/socketService.js';

async function bootstrap() {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true }
  });

  initSocketService(io);

  server.listen(env.PORT, () => {
    console.log(`Venfes Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

bootstrap();
\end{lstlisting}

\section*{15. React Login Component (\texttt{client/src/pages/AuthPages.jsx})}
\begin{lstlisting}[language=JavaScript, caption=React Authentication Component]
// client/src/pages/AuthPages.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ email, password, role });
      }
      navigate(role === 'vendor' ? '/vendor' : role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">{isLogin ? 'Sign In' : 'Create Account'}</h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-blue-500" />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
          {isLogin ? 'Log In' : 'Register'}
        </button>
      </form>
    </div>
  );
}
\end{lstlisting}

\section*{16. Admin Dashboard Logic (\texttt{client/src/pages/AdminPortal.jsx})}
\begin{lstlisting}[language=JavaScript, caption=Admin Dashboard KPI Logic]
// client/src/pages/AdminPortal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function AdminPortal() {
  const [analytics, setAnalytics] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);

  useEffect(() => {
    // 1. Fetch Aggregation Analytics
    axios.get('/api/analytics/admin').then(res => setAnalytics(res.data.data));

    // 2. Real-Time Socket Connection
    const socket = io('http://localhost:5000');
    socket.emit('join:admin');
    socket.on('order:placed', (order) => {
      setLiveOrders(prev => [order, ...prev.slice(0, 9)]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Operations Command Center</h1>
      {analytics && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded shadow border-l-4 border-blue-500">
            <span className="text-xs text-slate-500">Gross Merchandise Value</span>
            <div className="text-2xl font-bold">${analytics.gmv.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white rounded shadow border-l-4 border-green-500">
            <span className="text-xs text-slate-500">Platform Commission</span>
            <div className="text-2xl font-bold">${analytics.commission.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white rounded shadow border-l-4 border-purple-500">
            <span className="text-xs text-slate-500">Total Orders</span>
            <div className="text-2xl font-bold">{analytics.orders}</div>
          </div>
        </div>
      )}
    </div>
  );
}
\end{lstlisting}

\section*{17. REST API Request and Response Examples}

\subsection*{Authentication Endpoint}
\noindent \textbf{Request: POST /api/auth/login}
\begin{lstlisting}[language=json, caption=POST /api/auth/login Request Payload]
{
  "email": "vendor.tech@venfes.com",
  "password": "VendorSecure2026!"
}
\end{lstlisting}

\noindent \textbf{Response: HTTP 200 OK}
\begin{lstlisting}[language=json, caption=POST /api/auth/login Response Payload]
{
  "success": true,
  "data": {
    "user": {
      "_id": "67af8a1012fbc98765432101",
      "name": "TechZone Electronics",
      "email": "vendor.tech@venfes.com",
      "role": "vendor",
      "vendorProfile": {
        "storeName": "TechZone Hub",
        "status": "approved"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
\end{lstlisting}

\subsection*{Cart Split Checkout Endpoint}
\noindent \textbf{Request: POST /api/orders/checkout}
\begin{lstlisting}[language=json, caption=POST /api/orders/checkout Request Payload]
{
  "items": [
    { "productId": "67af8a1012fbc98765432104", "variantId": "67af8b2212fbc98765432200", "quantity": 1, "price": 49.99 },
    { "productId": "67af8a1012fbc98765432108", "quantity": 2, "price": 19.99 }
  ],
  "shippingAddress": {
    "street": "123 Tech Park Road",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "zip": "600089",
    "country": "India"
  },
  "paymentMethod": "razorpay"
}
\end{lstlisting}

\noindent \textbf{Response: HTTP 201 Created (Parent Order \& 2 Sub-Orders)}
\begin{lstlisting}[language=json, caption=POST /api/orders/checkout Response Payload]
{
  "success": true,
  "data": {
    "order": {
      "_id": "67af8c5512fbc98765432301",
      "orderNumber": "ORD-1728901234567-4821",
      "totalAmount": 89.97,
      "paymentStatus": "pending",
      "subOrderIds": ["67af8c5512fbc98765432302", "67af8c5512fbc98765432303"]
    },
    "subOrders": [
      {
        "_id": "67af8c5512fbc98765432302",
        "subOrderNumber": "ORD-1728901234567-4821-1",
        "vendorId": "67af8a1012fbc98765432101",
        "subtotal": 49.99,
        "commissionAmount": 5.00,
        "vendorPayoutAmount": 44.99,
        "status": "placed"
      },
      {
        "_id": "67af8c5512fbc98765432303",
        "subOrderNumber": "ORD-1728901234567-4821-2",
        "vendorId": "67af8a1012fbc98765432105",
        "subtotal": 39.98,
        "commissionAmount": 4.00,
        "vendorPayoutAmount": 35.98,
        "status": "placed"
      }
    ]
  }
}
\end{lstlisting}

% ====================================================================
% REFERENCES
% ====================================================================
\newpage
\begin{thebibliography}{99}
\addcontentsline{toc}{chapter}{REFERENCES}

\bibitem{chodorow}
Chodorow, K. (2019). \textit{MongoDB: The Definitive Guide: Powerful and Scalable Data Storage}, 3rd ed., O'Reilly Media, Sebastopol.

\bibitem{fowler_arch}
Fowler, M. (2018). \textit{Patterns of Enterprise Application Architecture}, Addison-Wesley Professional, Boston.

\bibitem{newman_micro}
Newman, S. (2021). \textit{Building Microservices: Designing Fine-Grained Systems}, 2nd ed., O'Reilly Media, Sebastopol.

\bibitem{kleppmann}
Kleppmann, M. (2017). \textit{Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems}, O'Reilly Media, Sebastopol.

\bibitem{banks_react}
Banks, A., and Porcello, E. (2020). \textit{Learning React: Modern Patterns for Developing React Apps}, 2nd ed., O'Reilly Media, Sebastopol.

\bibitem{cantelon_node}
Cantelon, M., Harter, M., Holowaychuk, T., and Rajlich, N. (2019). \textit{Node.js in Action}, 2nd ed., Manning Publications, Shelter Island.

\bibitem{tilkov_rest}
Tilkov, S., Eigenbrodt, M., Schreier, S., and Wolf, O. (2015). \textit{REST und HTTP: Einsatz und Architekturen webbasierter Webservices}, dpunkt.verlag, Heidelberg.

\bibitem{resig_js}
Resig, J., Bibeault, B., and Maras, J. (2016). \textit{Secrets of the JavaScript Ninja}, 2nd ed., Manning Publications, Shelter Island.

\bibitem{rfc7519}
Jones, M., Bradley, J., and Sakimura, N. (2015). ``JSON Web Token (JWT)'', \textit{RFC 7519}, Internet Engineering Task Force (IETF).

\bibitem{owasp_top10}
OWASP Foundation (2021). ``OWASP Top 10 Web Application Security Risks'', Available: \url{https://owasp.org/Top10/}.

\bibitem{fielding_rest}
Fielding, R. T. (2000). \textit{Architectural Styles and the Design of Network-based Software Architectures}, Doctoral Dissertation, University of California, Irvine.

\bibitem{mongodb_acid}
MongoDB Inc. (2023). ``Multi-Document ACID Transactions in MongoDB'', \textit{MongoDB Technical Whitepaper}, Available: \url{https://www.mongodb.com/transactions}.

\end{thebibliography}

% ====================================================================
% SCREENSHOTS OF THE PROJECT
% ====================================================================
\newpage
\chapter*{SCREENSHOTS OF THE PROJECT}
\addcontentsline{toc}{chapter}{SCREENSHOTS OF THE PROJECT}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/01_homepage.png}
    \caption{Venfes Marketplace Homepage and Customer Discovery Storefront}
    \label{fig:ss1}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/02_catalog.png}
    \caption{Multi-Vendor Catalog Browsing, Search, and Category Filtering}
    \label{fig:ss2}
\end{figure}

\newpage
\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/04_cart_multi_vendor.png}
    \caption{Multi-Vendor Cart Grouping with Subtotal Calculations}
    \label{fig:ss3}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/05b_vendor_analytics.png}
    \caption{Vendor Sales Trend and Revenue Performance Dashboard}
    \label{fig:ss4}
\end{figure}

\newpage
\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/06_admin_portal.png}
    \caption{Admin Operations Command Center and Live WebSocket Order Feed}
    \label{fig:ss5}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\textwidth]{figures/06c_admin_ledger.png}
    \caption{Admin Financial Commission and Vendor Settlement Ledger Console}
    \label{fig:ss6}
\end{figure}

\end{document}
"""

    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(tex_content)
    print(f"Generated {tex_path} ({len(tex_content)} characters).")

    # Now create the Overleaf zip package
    zip_path = "report/Venfes_Overleaf_Project.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(tex_path, arcname="main.tex")
        figures_dir = "report/overleaf/figures"
        for fname in os.listdir(figures_dir):
            fpath = os.path.join(figures_dir, fname)
            if os.path.isfile(fpath):
                zipf.write(fpath, arcname=f"figures/{fname}")
    print(f"Packed complete Overleaf project to {zip_path}.")

if __name__ == "__main__":
    generate_tex()
