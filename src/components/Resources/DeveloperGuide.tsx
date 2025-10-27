"use client";

import { useState } from "react";
import { EncryptionMode } from "@/types/trace";

// Language options for code examples
type Language = "javascript" | "python" | "java" | "csharp";

interface CodeExample {
  language: Language;
  setup: string;
  encryption: string;
  query: string;
}

interface EncryptionGuideProps {
  activeTab?: string;
}

export const DeveloperGuide: React.FC<EncryptionGuideProps> = ({
  activeTab = "setup"
}) => {
  const [currentTab, setCurrentTab] = useState<string>(activeTab);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("javascript");
  const [selectedEncryption, setSelectedEncryption] = useState<EncryptionMode>("qe");

  // Code examples for different languages and operations
  const codeExamples: Record<Language, CodeExample> = {
    javascript: {
      language: "javascript",
      setup: `// Set up MongoDB Client with QE requirements
const { MongoClient } = require('mongodb');
const { ClientEncryption } = require('mongodb-client-encryption');

// KMS provider configuration (replace with your settings)
const kmsProviders = {
  local: {
    key: Buffer.from('YOUR_LOCAL_MASTER_KEY', 'base64')
    // In production, use a KMS service provider
    // aws: { accessKeyId: '...', secretAccessKey: '...' }
  }
};

// Key vault namespace
const keyVaultNamespace = 'encryption.__keyVault';

// Connect to MongoDB with QE options
const client = new MongoClient('mongodb://localhost:27017', {
  autoEncryption: {
    keyVaultNamespace,
    kmsProviders,
    extraOptions: {
      cryptSharedLibPath: '/path/to/mongo_crypt_shared_v1.so'
    }
  }
});

// Create ClientEncryption for explicit encryption
const clientEncryption = new ClientEncryption(client, {
  keyVaultNamespace,
  kmsProviders
});

// Connect to the database
await client.connect();
const database = client.db('securehealth');
const patients = database.collection('patients');`,

      encryption: `// Create data encryption key (DEK)
const keyId = await clientEncryption.createDataKey('local', {
  keyAltNames: ['securehealth_patient_key']
});

// Define JSON schema for patient collection with QE
const patientSchema = {
  bsonType: "object",
  properties: {
    firstName: {
      encrypt: {
        keyId,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
        bsonType: "string"
        // Note: No queryType means randomized encryption
      }
    },
    lastName: {
      encrypt: {
        keyId,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
        bsonType: "string",
        queryType: "equality" // Queryable Encryption
      }
    },
    ssn: {
      encrypt: {
        keyId,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
        bsonType: "string"
        // Randomized encryption (maximum security)
      }
    },
    dateOfBirth: {
      encrypt: {
        keyId,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
        bsonType: "string",
        algorithm: "DETERMINISTIC" // Deterministic encryption
      }
    }
  }
};

// Insert patient data with auto-encryption
await patients.insertOne({
  firstName: "Jane",
  lastName: "Smith",
  ssn: "123-45-6789",
  dateOfBirth: "1990-05-15",
  medicalNotes: "Patient has hypertension..."
});

// Manual encryption (alternative approach)
const encryptedPatient = await clientEncryption.encrypt(
  {
    firstName: "Jane",
    lastName: "Smith",
    ssn: "123-45-6789",
    dateOfBirth: "1990-05-15"
  },
  patientSchema
);
await patients.insertOne(encryptedPatient);`,

      query: `// Query using Queryable Encryption
const result = await patients.findOne({
  lastName: "Smith" // Encrypted automatically
});

// Query using deterministic encryption
const dobResult = await patients.findOne({
  dateOfBirth: "1990-05-15"
});

// Decrypt results
const decryptedPatient = await clientEncryption.decrypt(result);
console.log(decryptedPatient);

// Cannot query randomized encrypted fields directly
// This will NOT work:
const ssnResult = await patients.findOne({
  ssn: "123-45-6789" // Error: cannot query randomized field
});

// Client-side filtering for randomized fields
const allPatients = await patients.find({}).toArray();
const decryptedPatients = await Promise.all(
  allPatients.map(p => clientEncryption.decrypt(p))
);
const filteredPatients = decryptedPatients.filter(
  p => p.ssn === "123-45-6789"
);`,
    },

    python: {
      language: "python",
      setup: `# Set up MongoDB Client with QE requirements
import base64
from pymongo import MongoClient
from pymongo.encryption import (
    ClientEncryption,
    Algorithm,
    QueryType
)

# KMS provider configuration (replace with your settings)
kms_providers = {
    "local": {
        "key": base64.b64decode("YOUR_LOCAL_MASTER_KEY")
        # In production, use a KMS service provider
        # "aws": {"accessKeyId": "...", "secretAccessKey": "..."}
    }
}

# Key vault namespace
key_vault_namespace = "encryption.__keyVault"

# Connect to MongoDB with QE options
client = MongoClient("mongodb://localhost:27017",
    auto_encryption_opts={
        "key_vault_namespace": key_vault_namespace,
        "kms_providers": kms_providers,
        "extra_options": {
            "cryptSharedLibPath": "/path/to/mongo_crypt_shared_v1.so"
        }
    }
)

# Create ClientEncryption for explicit encryption
client_encryption = ClientEncryption(
    client,
    key_vault_namespace=key_vault_namespace,
    kms_providers=kms_providers
)

# Connect to the database
database = client["securehealth"]
patients = database["patients"]`,

      encryption: `# Create data encryption key (DEK)
key_id = client_encryption.create_data_key(
    "local", key_alt_names=["securehealth_patient_key"]
)

# Define JSON schema for patient collection with QE
patient_schema = {
    "bsonType": "object",
    "properties": {
        "firstName": {
            "encrypt": {
                "keyId": key_id,
                "algorithm": Algorithm.AEAD_AES_256_CBC_HMAC_SHA_512,
                "bsonType": "string"
                # Note: No queryType means randomized encryption
            }
        },
        "lastName": {
            "encrypt": {
                "keyId": key_id,
                "algorithm": Algorithm.AEAD_AES_256_CBC_HMAC_SHA_512,
                "bsonType": "string",
                "queryType": QueryType.EQUALITY  # Queryable Encryption
            }
        },
        "ssn": {
            "encrypt": {
                "keyId": key_id,
                "algorithm": Algorithm.AEAD_AES_256_CBC_HMAC_SHA_512,
                "bsonType": "string"
                # Randomized encryption (maximum security)
            }
        },
        "dateOfBirth": {
            "encrypt": {
                "keyId": key_id,
                "algorithm": Algorithm.DETERMINISTIC,
                "bsonType": "string"
                # Deterministic encryption
            }
        }
    }
}

# Insert patient data with auto-encryption
patients.insert_one({
    "firstName": "Jane",
    "lastName": "Smith",
    "ssn": "123-45-6789",
    "dateOfBirth": "1990-05-15",
    "medicalNotes": "Patient has hypertension..."
})

# Manual encryption (alternative approach)
encrypted_patient = client_encryption.encrypt(
    {
        "firstName": "Jane",
        "lastName": "Smith",
        "ssn": "123-45-6789",
        "dateOfBirth": "1990-05-15"
    },
    patient_schema
)
patients.insert_one(encrypted_patient)`,

      query: `# Query using Queryable Encryption
result = patients.find_one({
    "lastName": "Smith"  # Encrypted automatically
})

# Query using deterministic encryption
dob_result = patients.find_one({
    "dateOfBirth": "1990-05-15"
})

# Decrypt results
decrypted_patient = client_encryption.decrypt(result)
print(decrypted_patient)

# Cannot query randomized encrypted fields directly
# This will NOT work:
ssn_result = patients.find_one({
    "ssn": "123-45-6789"  # Error: cannot query randomized field
})

# Client-side filtering for randomized fields
all_patients = list(patients.find({}))
decrypted_patients = [
    client_encryption.decrypt(p) for p in all_patients
]
filtered_patients = [
    p for p in decrypted_patients if p["ssn"] == "123-45-6789"
]`,
    },

    java: {
      language: "java",
      setup: `// Set up MongoDB Client with QE requirements
import com.mongodb.AutoEncryptionSettings;
import com.mongodb.ClientEncryptionSettings;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.vault.DataKeyOptions;
import com.mongodb.client.vault.ClientEncryption;
import com.mongodb.client.vault.ClientEncryptions;
import org.bson.Document;
import org.bson.BsonDocument;
import org.bson.BsonBinary;
import org.bson.BsonString;

import java.util.Map;
import java.util.HashMap;
import java.util.Base64;

// KMS provider configuration (replace with your settings)
Map<String, Map<String, Object>> kmsProviders = new HashMap<>();
Map<String, Object> localOptions = new HashMap<>();
localOptions.put("key", Base64.getDecoder().decode("YOUR_LOCAL_MASTER_KEY"));
kmsProviders.put("local", localOptions);

// Key vault namespace
String keyVaultNamespace = "encryption.__keyVault";
String keyVaultDb = keyVaultNamespace.split("\\.")[0];
String keyVaultColl = keyVaultNamespace.split("\\.")[1];

// Extra options for the mongocryptd process
Map<String, Object> extraOptions = new HashMap<>();
extraOptions.put("cryptSharedLibPath", "/path/to/mongo_crypt_shared_v1.so");

// Create encrypted client
AutoEncryptionSettings autoEncryptionSettings = AutoEncryptionSettings.builder()
    .keyVaultNamespace(keyVaultNamespace)
    .kmsProviders(kmsProviders)
    .extraOptions(extraOptions)
    .build();

MongoClientSettings clientSettings = MongoClientSettings.builder()
    .applyConnectionString(new ConnectionString("mongodb://localhost:27017"))
    .autoEncryptionSettings(autoEncryptionSettings)
    .build();

MongoClient client = MongoClients.create(clientSettings);
MongoCollection<Document> patients = client.getDatabase("securehealth")
    .getCollection("patients");

// Create ClientEncryption for explicit encryption
ClientEncryptionSettings encryptionSettings = ClientEncryptionSettings.builder()
    .keyVaultMongoClientSettings(MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString("mongodb://localhost:27017"))
        .build())
    .keyVaultNamespace(keyVaultNamespace)
    .kmsProviders(kmsProviders)
    .build();

ClientEncryption clientEncryption = ClientEncryptions.create(encryptionSettings);`,

      encryption: `// Create data encryption key (DEK)
BsonBinary keyId = clientEncryption.createDataKey("local",
    new DataKeyOptions().keyAltNames(Arrays.asList("securehealth_patient_key")));

// Define JSON schema for patient collection with QE
BsonDocument patientSchema = BsonDocument.parse("""
{
  "bsonType": "object",
  "properties": {
    "firstName": {
      "encrypt": {
        "keyId": keyId,
        "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512",
        "bsonType": "string"
      }
    },
    "lastName": {
      "encrypt": {
        "keyId": keyId,
        "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512",
        "bsonType": "string",
        "queryType": "equality"
      }
    },
    "ssn": {
      "encrypt": {
        "keyId": keyId,
        "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512",
        "bsonType": "string"
      }
    },
    "dateOfBirth": {
      "encrypt": {
        "keyId": keyId,
        "algorithm": "DETERMINISTIC",
        "bsonType": "string"
      }
    }
  }
}
""");

// Insert patient data with auto-encryption
Document patientDoc = new Document()
    .append("firstName", "Jane")
    .append("lastName", "Smith")
    .append("ssn", "123-45-6789")
    .append("dateOfBirth", "1990-05-15")
    .append("medicalNotes", "Patient has hypertension...");

patients.insertOne(patientDoc);

// Manual encryption (alternative approach)
BsonDocument patientBson = new BsonDocument()
    .append("firstName", new BsonString("Jane"))
    .append("lastName", new BsonString("Smith"))
    .append("ssn", new BsonString("123-45-6789"))
    .append("dateOfBirth", new BsonString("1990-05-15"));

BsonDocument encryptedPatient = clientEncryption.encrypt(patientBson, patientSchema);
patients.insertOne(Document.parse(encryptedPatient.toJson()));`,

      query: `// Query using Queryable Encryption
Document result = patients.find(new Document("lastName", "Smith")).first();

// Query using deterministic encryption
Document dobResult = patients.find(new Document("dateOfBirth", "1990-05-15")).first();

// Decrypt results
BsonDocument decryptedPatient = clientEncryption.decrypt(BsonDocument.parse(result.toJson()));
System.out.println(decryptedPatient.toJson());

// Cannot query randomized encrypted fields directly
// This will NOT work:
Document ssnResult = patients.find(new Document("ssn", "123-45-6789")).first();
// Error: cannot query randomized field

// Client-side filtering for randomized fields
List<Document> allPatients = patients.find().into(new ArrayList<>());
List<BsonDocument> decryptedPatients = allPatients.stream()
    .map(doc -> clientEncryption.decrypt(BsonDocument.parse(doc.toJson())))
    .collect(Collectors.toList());

List<BsonDocument> filteredPatients = decryptedPatients.stream()
    .filter(doc -> doc.getString("ssn").getValue().equals("123-45-6789"))
    .collect(Collectors.toList());`,
    },

    csharp: {
      language: "csharp",
      setup: `// Set up MongoDB Client with QE requirements
using MongoDB.Driver;
using MongoDB.Driver.Encryption;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// KMS provider configuration (replace with your settings)
var kmsProviders = new Dictionary<string, IReadOnlyDictionary<string, object>>
{
    {
        "local", new Dictionary<string, object>
        {
            { "key", Convert.FromBase64String("YOUR_LOCAL_MASTER_KEY") }
        }
    }
};

// Key vault namespace
var keyVaultNamespace = CollectionNamespace.FromFullName("encryption.__keyVault");

// Extra options for the mongocryptd process
var extraOptions = new Dictionary<string, object>
{
    { "cryptSharedLibPath", "/path/to/mongo_crypt_shared_v1.so" }
};

// Create encrypted client
var autoEncryptionOptions = new AutoEncryptionOptions(
    keyVaultNamespace: keyVaultNamespace,
    kmsProviders: kmsProviders,
    extraOptions: extraOptions);

var clientSettings = MongoClientSettings.FromConnectionString("mongodb://localhost:27017");
clientSettings.AutoEncryptionOptions = autoEncryptionOptions;

var client = new MongoClient(clientSettings);
var database = client.GetDatabase("securehealth");
var patients = database.GetCollection<BsonDocument>("patients");

// Create ClientEncryption for explicit encryption
var clientEncryptionSettings = new ClientEncryptionOptions(
    keyVaultClient: new MongoClient("mongodb://localhost:27017"),
    keyVaultNamespace: keyVaultNamespace,
    kmsProviders: kmsProviders);

var clientEncryption = new ClientEncryption(clientEncryptionSettings);`,

      encryption: `// Create data encryption key (DEK)
var keyId = await clientEncryption.CreateDataKeyAsync(
    "local", new DataKeyOptions { KeyAltNames = new[] { "securehealth_patient_key" } });

// Define JSON schema for patient collection with QE
var patientSchema = BsonDocument.Parse(@"
{
  ""bsonType"": ""object"",
  ""properties"": {
    ""firstName"": {
      ""encrypt"": {
        ""keyId"": keyId,
        ""algorithm"": ""AEAD_AES_256_CBC_HMAC_SHA_512"",
        ""bsonType"": ""string""
      }
    },
    ""lastName"": {
      ""encrypt"": {
        ""keyId"": keyId,
        ""algorithm"": ""AEAD_AES_256_CBC_HMAC_SHA_512"",
        ""bsonType"": ""string"",
        ""queryType"": ""equality""
      }
    },
    ""ssn"": {
      ""encrypt"": {
        ""keyId"": keyId,
        ""algorithm"": ""AEAD_AES_256_CBC_HMAC_SHA_512"",
        ""bsonType"": ""string""
      }
    },
    ""dateOfBirth"": {
      ""encrypt"": {
        ""keyId"": keyId,
        ""algorithm"": ""DETERMINISTIC"",
        ""bsonType"": ""string""
      }
    }
  }
}");

// Insert patient data with auto-encryption
var patientDoc = new BsonDocument
{
    { "firstName", "Jane" },
    { "lastName", "Smith" },
    { "ssn", "123-45-6789" },
    { "dateOfBirth", "1990-05-15" },
    { "medicalNotes", "Patient has hypertension..." }
};

await patients.InsertOneAsync(patientDoc);

// Manual encryption (alternative approach)
var patientToEncrypt = new BsonDocument
{
    { "firstName", "Jane" },
    { "lastName", "Smith" },
    { "ssn", "123-45-6789" },
    { "dateOfBirth", "1990-05-15" }
};

var encryptedPatient = await clientEncryption.EncryptAsync(
    patientToEncrypt, patientSchema);

await patients.InsertOneAsync(encryptedPatient);`,

      query: `// Query using Queryable Encryption
var filter = Builders<BsonDocument>.Filter.Eq("lastName", "Smith");
var result = await patients.Find(filter).FirstOrDefaultAsync();

// Query using deterministic encryption
var dobFilter = Builders<BsonDocument>.Filter.Eq("dateOfBirth", "1990-05-15");
var dobResult = await patients.Find(dobFilter).FirstOrDefaultAsync();

// Decrypt results
var decryptedPatient = await clientEncryption.DecryptAsync(result);
Console.WriteLine(decryptedPatient.ToJson());

// Cannot query randomized encrypted fields directly
// This will NOT work:
var ssnFilter = Builders<BsonDocument>.Filter.Eq("ssn", "123-45-6789");
var ssnResult = await patients.Find(ssnFilter).FirstOrDefaultAsync();
// Error: cannot query randomized field

// Client-side filtering for randomized fields
var allPatients = await patients.Find(Builders<BsonDocument>.Filter.Empty)
    .ToListAsync();

var decryptedPatients = new List<BsonDocument>();
foreach (var patient in allPatients)
{
    var decrypted = await clientEncryption.DecryptAsync(patient);
    decryptedPatients.Add(decrypted);
}

var filteredPatients = decryptedPatients
    .Where(p => p["ssn"].AsString == "123-45-6789")
    .ToList();`,
    },
  };

  const encryptionTypes: Record<EncryptionMode, { title: string; description: string; color: string }> = {
    qe: {
      title: "Queryable Encryption",
      description: "Enables equality searches on encrypted fields using specialized indexes.",
      color: "bg-primary/20 text-primary border-primary/30"
    },
    det: {
      title: "Deterministic Encryption",
      description: "Same input always produces same output. Enables equality matches but with reduced security.",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },
    rand: {
      title: "Randomized Encryption",
      description: "Maximum security with different ciphertext for same input. Cannot be directly queried.",
      color: "bg-red-500/20 text-red-400 border-red-500/30"
    },
    none: {
      title: "No Encryption",
      description: "Plaintext data without encryption. Not recommended for sensitive information.",
      color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
    }
  };

  return (
    <div className="bg-mongo-dark-800 rounded-lg border border-accent/20">
      {/* Tab Navigation */}
      <div className="flex border-b border-accent/20 overflow-x-auto">
        <button
          onClick={() => setCurrentTab("setup")}
          className={`px-4 py-3 text-sm whitespace-nowrap ${
            currentTab === "setup"
              ? "border-b-2 border-primary text-primary"
              : "text-neutral-300 hover:bg-mongo-dark-700"
          }`}
        >
          1. Client Setup
        </button>
        <button
          onClick={() => setCurrentTab("encryption")}
          className={`px-4 py-3 text-sm whitespace-nowrap ${
            currentTab === "encryption"
              ? "border-b-2 border-primary text-primary"
              : "text-neutral-300 hover:bg-mongo-dark-700"
          }`}
        >
          2. Data Encryption
        </button>
        <button
          onClick={() => setCurrentTab("query")}
          className={`px-4 py-3 text-sm whitespace-nowrap ${
            currentTab === "query"
              ? "border-b-2 border-primary text-primary"
              : "text-neutral-300 hover:bg-mongo-dark-700"
          }`}
        >
          3. Querying Data
        </button>
        <button
          onClick={() => setCurrentTab("types")}
          className={`px-4 py-3 text-sm whitespace-nowrap ${
            currentTab === "types"
              ? "border-b-2 border-primary text-primary"
              : "text-neutral-300 hover:bg-mongo-dark-700"
          }`}
        >
          Encryption Types
        </button>
        <button
          onClick={() => setCurrentTab("faq")}
          className={`px-4 py-3 text-sm whitespace-nowrap ${
            currentTab === "faq"
              ? "border-b-2 border-primary text-primary"
              : "text-neutral-300 hover:bg-mongo-dark-700"
          }`}
        >
          FAQ
        </button>
      </div>

      {/* Language Selector */}
      {(currentTab === "setup" || currentTab === "encryption" || currentTab === "query") && (
        <div className="flex border-b border-accent/20 bg-mongo-dark-700 px-3 py-2">
          <div className="text-xs text-neutral-400 mr-2">Language:</div>
          <div className="flex gap-2">
            {(["javascript", "python", "java", "csharp"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 py-0.5 rounded text-xs ${
                  selectedLanguage === lang
                    ? "bg-primary/20 text-primary"
                    : "bg-mongo-dark-800 text-neutral-300 hover:bg-mongo-dark-600"
                }`}
              >
                {lang === "javascript" ? "JavaScript" :
                 lang === "python" ? "Python" :
                 lang === "java" ? "Java" :
                 "C#"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-4">
        {/* Setup Content */}
        {currentTab === "setup" && (
          <div>
            <h2 className="text-lg font-medium text-primary mb-2">Client Setup for Queryable Encryption</h2>
            <p className="text-sm text-neutral-300 mb-4">
              This code shows how to configure a MongoDB client with Queryable Encryption capabilities.
            </p>
            <pre className="bg-mongo-dark-900 rounded-lg p-4 overflow-auto text-sm text-neutral-200 font-mono h-96">
              {codeExamples[selectedLanguage].setup}
            </pre>
            <div className="mt-4 bg-mongo-dark-700 rounded p-3 border border-accent/10">
              <h3 className="text-sm font-medium text-neutral-200 mb-2">Key Setup Notes</h3>
              <ul className="text-xs text-neutral-400 space-y-2 ml-4 list-disc">
                <li>For production, use a proper Key Management Service (AWS KMS, GCP KMS, Azure Key Vault) instead of local key.</li>
                <li>The cryptSharedLibPath points to the C++ shared library required for encryption operations.</li>
                <li>The key vault namespace stores your data encryption keys separately from your encrypted data.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Encryption Content */}
        {currentTab === "encryption" && (
          <div>
            <h2 className="text-lg font-medium text-primary mb-2">Encrypting Data with MongoDB</h2>
            <p className="text-sm text-neutral-300 mb-4">
              Learn how to encrypt fields with different encryption types for various security needs.
            </p>
            <pre className="bg-mongo-dark-900 rounded-lg p-4 overflow-auto text-sm text-neutral-200 font-mono h-96">
              {codeExamples[selectedLanguage].encryption}
            </pre>
            <div className="mt-4 bg-mongo-dark-700 rounded p-3 border border-accent/10">
              <h3 className="text-sm font-medium text-neutral-200 mb-2">Encryption Options</h3>
              <ul className="text-xs text-neutral-400 space-y-2 ml-4 list-disc">
                <li><span className="text-primary font-medium">Queryable Encryption:</span> Add <code className="bg-mongo-dark-900 px-1 py-0.5 rounded">queryType: "equality"</code> to enable equality searches.</li>
                <li><span className="text-yellow-400 font-medium">Deterministic Encryption:</span> Use <code className="bg-mongo-dark-900 px-1 py-0.5 rounded">algorithm: "DETERMINISTIC"</code> for exact matches.</li>
                <li><span className="text-red-400 font-medium">Randomized Encryption:</span> Default when no queryType is specified. Provides maximum security.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Query Content */}
        {currentTab === "query" && (
          <div>
            <h2 className="text-lg font-medium text-primary mb-2">Querying Encrypted Data</h2>
            <p className="text-sm text-neutral-300 mb-4">
              Learn how to search and filter encrypted data based on encryption type.
            </p>
            <pre className="bg-mongo-dark-900 rounded-lg p-4 overflow-auto text-sm text-neutral-200 font-mono h-96">
              {codeExamples[selectedLanguage].query}
            </pre>
            <div className="mt-4 bg-mongo-dark-700 rounded p-3 border border-accent/10">
              <h3 className="text-sm font-medium text-neutral-200 mb-2">Query Considerations</h3>
              <ul className="text-xs text-neutral-400 space-y-2 ml-4 list-disc">
                <li>Queryable encrypted fields can be searched directly with equality conditions.</li>
                <li>Deterministic encrypted fields can also be searched but with reduced security.</li>
                <li>Randomized encrypted fields cannot be directly queried - you must retrieve all documents and filter after decryption.</li>
                <li>The client automatically handles encryption/decryption when configured properly.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Encryption Types Content */}
        {currentTab === "types" && (
          <div>
            <h2 className="text-lg font-medium text-primary mb-2">Encryption Types Comparison</h2>
            <p className="text-sm text-neutral-300 mb-4">
              MongoDB offers multiple encryption options with different security and query capabilities.
            </p>

            <div className="space-y-4">
              {(["qe", "det", "rand", "none"] as EncryptionMode[]).map((type) => (
                <div
                  key={type}
                  className={`p-4 rounded-lg border ${
                    selectedEncryption === type ? "bg-mongo-dark-700 border-primary/30" : "bg-mongo-dark-900 border-accent/10"
                  }`}
                  onClick={() => setSelectedEncryption(type)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-neutral-200">{encryptionTypes[type].title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-mono border ${encryptionTypes[type].color}`}>
                      {type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mt-2">
                    {encryptionTypes[type].description}
                  </p>

                  {selectedEncryption === type && (
                    <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-mongo-dark-800 p-3 rounded">
                        <h4 className="text-neutral-300 font-medium mb-1">Security Level</h4>
                        <div className="flex items-center gap-1">
                          {type === "rand" && (
                            <span className="text-green-400">★★★★★ Highest</span>
                          )}
                          {type === "qe" && (
                            <span className="text-green-400">★★★★☆ Very High</span>
                          )}
                          {type === "det" && (
                            <span className="text-yellow-400">★★★☆☆ Medium</span>
                          )}
                          {type === "none" && (
                            <span className="text-red-400">None</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-mongo-dark-800 p-3 rounded">
                        <h4 className="text-neutral-300 font-medium mb-1">Query Support</h4>
                        <div>
                          {type === "qe" && (
                            <span className="text-green-400">Equality searches</span>
                          )}
                          {type === "det" && (
                            <span className="text-green-400">Equality searches</span>
                          )}
                          {type === "rand" && (
                            <span className="text-red-400">Cannot query directly</span>
                          )}
                          {type === "none" && (
                            <span className="text-green-400">All query types</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-mongo-dark-800 p-3 rounded">
                        <h4 className="text-neutral-300 font-medium mb-1">Best For</h4>
                        <div>
                          {type === "qe" && (
                            <span className="text-neutral-300">Fields needing both security and searchability</span>
                          )}
                          {type === "det" && (
                            <span className="text-neutral-300">Fields with unique values that need exact matching</span>
                          )}
                          {type === "rand" && (
                            <span className="text-neutral-300">Highly sensitive data (SSN, medical records)</span>
                          )}
                          {type === "none" && (
                            <span className="text-neutral-300">Non-sensitive data</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEncryption === type && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-neutral-300 mb-2">Example Use Case</h4>
                      <div className="bg-mongo-dark-800 p-3 rounded text-xs text-neutral-400">
                        {type === "qe" && (
                          <>
                            <p><span className="text-primary font-medium">Patient Name:</span> Use Queryable Encryption when you need to search for patients by name while keeping the data encrypted.</p>
                            <pre className="bg-mongo-dark-900 p-2 mt-2 rounded">
                              {`db.patients.find({ "lastName": "Smith" })`}
                            </pre>
                          </>
                        )}
                        {type === "det" && (
                          <>
                            <p><span className="text-yellow-400 font-medium">Date of Birth:</span> Use Deterministic Encryption when you need exact matching and the field has many possible values.</p>
                            <pre className="bg-mongo-dark-900 p-2 mt-2 rounded">
                              {`db.patients.find({ "dateOfBirth": "1990-05-15" })`}
                            </pre>
                          </>
                        )}
                        {type === "rand" && (
                          <>
                            <p><span className="text-red-400 font-medium">Social Security Number:</span> Use Randomized Encryption for maximum security on highly sensitive fields.</p>
                            <pre className="bg-mongo-dark-900 p-2 mt-2 rounded">
                              {`// Cannot query directly - must decrypt and filter
const allPatients = await patients.find({}).toArray();
const decrypted = await Promise.all(
  allPatients.map(p => clientEncryption.decrypt(p))
);
const filtered = decrypted.filter(p => p.ssn === "123-45-6789");`}
                            </pre>
                          </>
                        )}
                        {type === "none" && (
                          <>
                            <p><span className="text-neutral-400 font-medium">Address:</span> Use no encryption for non-sensitive fields that need full query capabilities.</p>
                            <pre className="bg-mongo-dark-900 p-2 mt-2 rounded">
                              {`db.patients.find({
  "address.city": "Boston",
  "address.zipCode": { $regex: /^021/ }
})`}
                            </pre>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Content */}
        {currentTab === "faq" && (
          <div>
            <h2 className="text-lg font-medium text-primary mb-4">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                <h3 className="text-sm font-medium text-neutral-200 mb-2">What is MongoDB Queryable Encryption?</h3>
                <p className="text-xs text-neutral-400">
                  MongoDB Queryable Encryption is a feature that allows you to encrypt sensitive data fields while still being able to perform queries on those encrypted fields. It uses specialized encryption techniques that allow equality searches on encrypted data without exposing the plaintext values to the database server.
                </p>
              </div>

              <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                <h3 className="text-sm font-medium text-neutral-200 mb-2">What types of queries are supported with Queryable Encryption?</h3>
                <p className="text-xs text-neutral-400">
                  Currently, MongoDB Queryable Encryption supports equality queries on encrypted fields. Range queries, sorting, text searches, and other query types are not supported directly on encrypted fields.
                </p>
              </div>

              <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                <h3 className="text-sm font-medium text-neutral-200 mb-2">Is there a performance impact when using Queryable Encryption?</h3>
                <p className="text-xs text-neutral-400">
                  Yes, there is some performance overhead due to the encryption and decryption operations. However, MongoDB has optimized the implementation to minimize this impact. For fields with Queryable Encryption, specialized indexes are created that enable efficient searches on encrypted data.
                </p>
              </div>

              <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                <h3 className="text-sm font-medium text-neutral-200 mb-2">Can I migrate existing collections to use Queryable Encryption?</h3>
                <p className="text-xs text-neutral-400">
                  Yes, you can migrate existing collections, but it requires a data transformation process. You'll need to:
                  <br/><br/>
                  1. Create a new collection with the encryption schema
                  <br/>
                  2. Read data from the old collection, encrypt it, and write it to the new collection
                  <br/>
                  3. Verify the migration and switch your application to the new collection
                </p>
              </div>

              <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                <h3 className="text-sm font-medium text-neutral-200 mb-2">How do I handle key management?</h3>
                <p className="text-xs text-neutral-400">
                  For production deployments, it's recommended to use a Key Management Service (KMS) like AWS KMS, GCP KMS, or Azure Key Vault. These services provide secure key storage and rotation capabilities. MongoDB stores encrypted Data Encryption Keys (DEKs) in a key vault collection and uses the Customer Master Key (CMK) from your chosen KMS to protect these DEKs.
                </p>
              </div>

              <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                <h3 className="text-sm font-medium text-neutral-200 mb-2">What happens if I lose my encryption keys?</h3>
                <p className="text-xs text-neutral-400">
                  If you lose access to your encryption keys, you will not be able to decrypt the data. There is no backdoor or recovery mechanism. This is why it's critical to use a proper key management solution and have appropriate backup procedures for your key material.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-primary/10 p-4 rounded-lg border border-primary/30">
              <h3 className="text-sm font-medium text-primary mb-2">Additional Resources</h3>
              <ul className="text-xs text-neutral-300 space-y-2 ml-4 list-disc">
                <li><a href="https://www.mongodb.com/docs/manual/core/queryable-encryption/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">MongoDB Queryable Encryption Documentation</a></li>
                <li><a href="https://www.mongodb.com/security/client-side-encryption" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Client-Side Field Level Encryption Overview</a></li>
                <li><a href="https://www.mongodb.com/docs/drivers/security/client-side-field-level-encryption-guide/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Client-Side Field Level Encryption Guide</a></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperGuide;