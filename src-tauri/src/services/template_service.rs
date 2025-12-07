//! Template management service

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;

use crate::models::{EditorSequence, SimpleExposure, SimpleSequence, SimpleTarget};
use crate::services::file_service;

/// Template metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TemplateMetadata {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: Vec<String>,
    pub is_builtin: bool,
}

/// Simple sequence template
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleSequenceTemplate {
    pub metadata: TemplateMetadata,
    pub sequence: SimpleSequence,
}

/// Target template
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetTemplate {
    pub metadata: TemplateMetadata,
    pub target: SimpleTarget,
}

/// Exposure set template
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExposureSetTemplate {
    pub metadata: TemplateMetadata,
    pub exposures: Vec<SimpleExposure>,
}

/// Editor sequence template
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorSequenceTemplate {
    pub metadata: TemplateMetadata,
    pub sequence: EditorSequence,
}

/// Get templates directory
pub fn get_templates_directory() -> PathBuf {
    file_service::get_app_data_directory().join("templates")
}

/// Get simple sequence templates directory
pub fn get_simple_templates_directory() -> PathBuf {
    get_templates_directory().join("simple")
}

/// Get target templates directory
pub fn get_target_templates_directory() -> PathBuf {
    get_templates_directory().join("targets")
}

/// Get exposure templates directory
pub fn get_exposure_templates_directory() -> PathBuf {
    get_templates_directory().join("exposures")
}

/// Get editor sequence templates directory
pub fn get_editor_templates_directory() -> PathBuf {
    get_templates_directory().join("editor")
}

/// Ensure template directories exist
pub async fn ensure_template_directories() -> Result<(), String> {
    let dirs = [
        get_simple_templates_directory(),
        get_target_templates_directory(),
        get_exposure_templates_directory(),
        get_editor_templates_directory(),
    ];

    for dir in dirs {
        fs::create_dir_all(&dir)
            .await
            .map_err(|e| format!("Failed to create template directory: {}", e))?;
    }

    Ok(())
}

/// Save simple sequence template
pub async fn save_simple_sequence_template(
    name: &str,
    description: &str,
    category: &str,
    tags: Vec<String>,
    sequence: SimpleSequence,
) -> Result<TemplateMetadata, String> {
    ensure_template_directories().await?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();

    let metadata = TemplateMetadata {
        id: id.clone(),
        name: name.to_string(),
        description: description.to_string(),
        category: category.to_string(),
        created_at: now,
        updated_at: now,
        tags,
        is_builtin: false,
    };

    let template = SimpleSequenceTemplate {
        metadata: metadata.clone(),
        sequence,
    };

    let path = get_simple_templates_directory().join(format!("{}.json", id));
    let content = serde_json::to_string_pretty(&template)
        .map_err(|e| format!("Failed to serialize template: {}", e))?;

    fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to save template: {}", e))?;

    Ok(metadata)
}

/// Load simple sequence template
pub async fn load_simple_sequence_template(id: &str) -> Result<SimpleSequenceTemplate, String> {
    let path = get_simple_templates_directory().join(format!("{}.json", id));

    let content = fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read template: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse template: {}", e))
}

/// List simple sequence templates
pub async fn list_simple_sequence_templates() -> Result<Vec<TemplateMetadata>, String> {
    let dir = get_simple_templates_directory();

    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut templates = Vec::new();
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read templates directory: {}", e))?;

    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path).await {
                if let Ok(template) = serde_json::from_str::<SimpleSequenceTemplate>(&content) {
                    templates.push(template.metadata);
                }
            }
        }
    }

    // Sort by name
    templates.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(templates)
}

/// Delete simple sequence template
pub async fn delete_simple_sequence_template(id: &str) -> Result<(), String> {
    let path = get_simple_templates_directory().join(format!("{}.json", id));

    if !path.exists() {
        return Err("Template not found".to_string());
    }

    // Check if it's a builtin template
    if let Ok(content) = fs::read_to_string(&path).await {
        if let Ok(template) = serde_json::from_str::<SimpleSequenceTemplate>(&content) {
            if template.metadata.is_builtin {
                return Err("Cannot delete builtin template".to_string());
            }
        }
    }

    fs::remove_file(&path)
        .await
        .map_err(|e| format!("Failed to delete template: {}", e))
}

/// Save target template
pub async fn save_target_template(
    name: &str,
    description: &str,
    tags: Vec<String>,
    target: SimpleTarget,
) -> Result<TemplateMetadata, String> {
    ensure_template_directories().await?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();

    let metadata = TemplateMetadata {
        id: id.clone(),
        name: name.to_string(),
        description: description.to_string(),
        category: "target".to_string(),
        created_at: now,
        updated_at: now,
        tags,
        is_builtin: false,
    };

    let template = TargetTemplate {
        metadata: metadata.clone(),
        target,
    };

    let path = get_target_templates_directory().join(format!("{}.json", id));
    let content = serde_json::to_string_pretty(&template)
        .map_err(|e| format!("Failed to serialize template: {}", e))?;

    fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to save template: {}", e))?;

    Ok(metadata)
}

/// Load target template
pub async fn load_target_template(id: &str) -> Result<TargetTemplate, String> {
    let path = get_target_templates_directory().join(format!("{}.json", id));

    let content = fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read template: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse template: {}", e))
}

/// List target templates
pub async fn list_target_templates() -> Result<Vec<TemplateMetadata>, String> {
    let dir = get_target_templates_directory();

    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut templates = Vec::new();
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read templates directory: {}", e))?;

    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path).await {
                if let Ok(template) = serde_json::from_str::<TargetTemplate>(&content) {
                    templates.push(template.metadata);
                }
            }
        }
    }

    templates.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(templates)
}

/// Save exposure set template
pub async fn save_exposure_set_template(
    name: &str,
    description: &str,
    tags: Vec<String>,
    exposures: Vec<SimpleExposure>,
) -> Result<TemplateMetadata, String> {
    ensure_template_directories().await?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();

    let metadata = TemplateMetadata {
        id: id.clone(),
        name: name.to_string(),
        description: description.to_string(),
        category: "exposure".to_string(),
        created_at: now,
        updated_at: now,
        tags,
        is_builtin: false,
    };

    let template = ExposureSetTemplate {
        metadata: metadata.clone(),
        exposures,
    };

    let path = get_exposure_templates_directory().join(format!("{}.json", id));
    let content = serde_json::to_string_pretty(&template)
        .map_err(|e| format!("Failed to serialize template: {}", e))?;

    fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to save template: {}", e))?;

    Ok(metadata)
}

/// Load exposure set template
pub async fn load_exposure_set_template(id: &str) -> Result<ExposureSetTemplate, String> {
    let path = get_exposure_templates_directory().join(format!("{}.json", id));

    let content = fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read template: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse template: {}", e))
}

/// List exposure set templates
pub async fn list_exposure_set_templates() -> Result<Vec<TemplateMetadata>, String> {
    let dir = get_exposure_templates_directory();

    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut templates = Vec::new();
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read templates directory: {}", e))?;

    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path).await {
                if let Ok(template) = serde_json::from_str::<ExposureSetTemplate>(&content) {
                    templates.push(template.metadata);
                }
            }
        }
    }

    templates.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(templates)
}
