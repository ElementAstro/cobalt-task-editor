//! NINA sequence format serializer
//! 
//! Handles conversion between editor format and NINA JSON format

use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};

use crate::models::{EditorSequence, EditorSequenceItem, EditorCondition, EditorTrigger};

static NINA_ID_COUNTER: AtomicU32 = AtomicU32::new(0);

/// Reset NINA ID counter
pub fn reset_nina_ids() {
    NINA_ID_COUNTER.store(0, Ordering::SeqCst);
}

/// Get next NINA ID
fn next_nina_id() -> String {
    NINA_ID_COUNTER.fetch_add(1, Ordering::SeqCst).to_string()
}

/// Export editor sequence to NINA JSON format
pub fn export_to_nina(sequence: &EditorSequence) -> Result<String, String> {
    reset_nina_ids();
    
    let root_id = next_nina_id();
    
    // Create area containers
    let start_container = create_area_container(
        &sequence.start_items,
        "Start Area",
        "NINA.Sequencer.Container.StartAreaContainer, NINA.Sequencer",
        &root_id,
    );
    
    let target_container = create_area_container(
        &sequence.target_items,
        "Target Area",
        "NINA.Sequencer.Container.TargetAreaContainer, NINA.Sequencer",
        &root_id,
    );
    
    let end_container = create_area_container(
        &sequence.end_items,
        "End Area",
        "NINA.Sequencer.Container.EndAreaContainer, NINA.Sequencer",
        &root_id,
    );
    
    // Create root container
    let root = json!({
        "$id": root_id,
        "$type": "NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer",
        "Name": sequence.title,
        "SequenceTitle": sequence.title,
        "Strategy": {
            "$type": "NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer"
        },
        "IsExpanded": true,
        "Items": {
            "$id": next_nina_id(),
            "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel",
            "$values": [start_container, target_container, end_container]
        },
        "Conditions": {
            "$id": next_nina_id(),
            "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel",
            "$values": []
        },
        "Triggers": create_triggers_collection(&sequence.global_triggers, &root_id),
        "Parent": null
    });
    
    serde_json::to_string_pretty(&root)
        .map_err(|e| format!("Failed to serialize NINA JSON: {}", e))
}

/// Create area container
fn create_area_container(
    items: &[EditorSequenceItem],
    name: &str,
    type_name: &str,
    parent_id: &str,
) -> Value {
    let container_id = next_nina_id();
    
    json!({
        "$id": container_id,
        "$type": type_name,
        "Name": name,
        "Strategy": {
            "$type": "NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer"
        },
        "IsExpanded": true,
        "Items": {
            "$id": next_nina_id(),
            "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel",
            "$values": items.iter().map(|item| create_nina_item(item, &container_id)).collect::<Vec<_>>()
        },
        "Conditions": {
            "$id": next_nina_id(),
            "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel",
            "$values": []
        },
        "Triggers": {
            "$id": next_nina_id(),
            "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel",
            "$values": []
        },
        "Parent": {
            "$ref": parent_id
        }
    })
}

/// Create NINA item from editor item
fn create_nina_item(item: &EditorSequenceItem, parent_id: &str) -> Value {
    let item_id = next_nina_id();
    let is_container = item.item_type.contains("Container") 
        || item.item_type.contains("SmartExposure")
        || item.item_type.contains("InstructionSet");
    
    let mut nina_item = json!({
        "$id": item_id,
        "$type": item.item_type,
        "Name": item.name,
        "Parent": {
            "$ref": parent_id
        }
    });
    
    // Add data fields
    if let Some(obj) = nina_item.as_object_mut() {
        for (key, value) in &item.data {
            // Convert camelCase to PascalCase for NINA format
            let pascal_key = to_pascal_case(key);
            obj.insert(pascal_key, value.clone());
        }
    }
    
    // Add container-specific fields
    if is_container {
        if let Some(obj) = nina_item.as_object_mut() {
            obj.insert("Strategy".to_string(), json!({
                "$type": "NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer"
            }));
            obj.insert("IsExpanded".to_string(), json!(item.is_expanded.unwrap_or(true)));
            
            // Add nested items
            let nested_items = item.items.as_ref().map(|items| {
                items.iter().map(|i| create_nina_item(i, &item_id)).collect::<Vec<_>>()
            }).unwrap_or_default();
            
            obj.insert("Items".to_string(), json!({
                "$id": next_nina_id(),
                "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel",
                "$values": nested_items
            }));
            
            // Add conditions
            let conditions = item.conditions.as_ref().map(|conds| {
                conds.iter().map(|c| create_nina_condition(c, &item_id)).collect::<Vec<_>>()
            }).unwrap_or_default();
            
            obj.insert("Conditions".to_string(), json!({
                "$id": next_nina_id(),
                "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel",
                "$values": conditions
            }));
            
            // Add triggers
            let triggers = item.triggers.as_ref().map(|trigs| {
                trigs.iter().map(|t| create_nina_trigger(t, &item_id)).collect::<Vec<_>>()
            }).unwrap_or_default();
            
            obj.insert("Triggers".to_string(), json!({
                "$id": next_nina_id(),
                "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel",
                "$values": triggers
            }));
        }
    }
    
    nina_item
}

/// Create NINA condition
fn create_nina_condition(condition: &EditorCondition, parent_id: &str) -> Value {
    let condition_id = next_nina_id();
    
    let mut nina_condition = json!({
        "$id": condition_id,
        "$type": condition.condition_type,
        "Name": condition.name,
        "Parent": {
            "$ref": parent_id
        }
    });
    
    // Add data fields
    if let Some(obj) = nina_condition.as_object_mut() {
        for (key, value) in &condition.data {
            let pascal_key = to_pascal_case(key);
            obj.insert(pascal_key, value.clone());
        }
    }
    
    nina_condition
}

/// Create NINA trigger
fn create_nina_trigger(trigger: &EditorTrigger, parent_id: &str) -> Value {
    let trigger_id = next_nina_id();
    
    let mut nina_trigger = json!({
        "$id": trigger_id,
        "$type": trigger.trigger_type,
        "Name": trigger.name,
        "Parent": {
            "$ref": parent_id
        }
    });
    
    // Add data fields
    if let Some(obj) = nina_trigger.as_object_mut() {
        for (key, value) in &trigger.data {
            let pascal_key = to_pascal_case(key);
            obj.insert(pascal_key, value.clone());
        }
    }
    
    // Add trigger items if present
    if let Some(items) = &trigger.trigger_items {
        if let Some(obj) = nina_trigger.as_object_mut() {
            let trigger_items: Vec<Value> = items
                .iter()
                .map(|item| create_nina_item(item, &trigger_id))
                .collect();
            
            obj.insert("TriggerItems".to_string(), json!({
                "$id": next_nina_id(),
                "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel",
                "$values": trigger_items
            }));
        }
    }
    
    nina_trigger
}

/// Create triggers collection
fn create_triggers_collection(triggers: &[EditorTrigger], parent_id: &str) -> Value {
    let trigger_values: Vec<Value> = triggers
        .iter()
        .map(|t| create_nina_trigger(t, parent_id))
        .collect();
    
    json!({
        "$id": next_nina_id(),
        "$type": "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel",
        "$values": trigger_values
    })
}

/// Convert camelCase to PascalCase
fn to_pascal_case(s: &str) -> String {
    let mut result = String::new();
    let mut capitalize_next = true;
    
    for c in s.chars() {
        if capitalize_next {
            result.push(c.to_ascii_uppercase());
            capitalize_next = false;
        } else {
            result.push(c);
        }
    }
    
    result
}

/// Import NINA JSON to editor sequence
pub fn import_from_nina(json_str: &str) -> Result<EditorSequence, String> {
    let data: Value = serde_json::from_str(json_str)
        .map_err(|e| format!("Failed to parse NINA JSON: {}", e))?;
    
    // Check if it's a root container or template
    let type_str = data.get("$type")
        .and_then(|v| v.as_str())
        .ok_or("Missing $type field")?;
    
    if type_str.contains("SequenceRootContainer") {
        import_root_container(&data)
    } else if type_str.contains("Container") {
        import_template(&data)
    } else {
        Err("Unknown NINA format".to_string())
    }
}

/// Import root container
fn import_root_container(data: &Value) -> Result<EditorSequence, String> {
    let title = data.get("SequenceTitle")
        .or_else(|| data.get("Name"))
        .and_then(|v| v.as_str())
        .unwrap_or("Imported Sequence")
        .to_string();
    
    let items = data.get("Items")
        .and_then(|v| v.get("$values"))
        .and_then(|v| v.as_array())
        .ok_or("Missing Items array")?;
    
    let mut start_items = Vec::new();
    let mut target_items = Vec::new();
    let mut end_items = Vec::new();
    
    for item in items {
        let item_type = item.get("$type").and_then(|v| v.as_str()).unwrap_or("");
        let imported_items = import_container_items(item)?;
        
        if item_type.contains("StartAreaContainer") {
            start_items = imported_items;
        } else if item_type.contains("TargetAreaContainer") {
            target_items = imported_items;
        } else if item_type.contains("EndAreaContainer") {
            end_items = imported_items;
        }
    }
    
    // Import global triggers
    let global_triggers = data.get("Triggers")
        .and_then(|v| v.get("$values"))
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(import_trigger).collect())
        .unwrap_or_default();
    
    Ok(EditorSequence {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        start_items,
        target_items,
        end_items,
        global_triggers,
    })
}

/// Import template (single container)
fn import_template(data: &Value) -> Result<EditorSequence, String> {
    let title = data.get("Name")
        .and_then(|v| v.as_str())
        .unwrap_or("Imported Template")
        .to_string();
    
    let items = import_container_items(data)?;
    
    Ok(EditorSequence {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        start_items: Vec::new(),
        target_items: items,
        end_items: Vec::new(),
        global_triggers: Vec::new(),
    })
}

/// Import container items
fn import_container_items(container: &Value) -> Result<Vec<EditorSequenceItem>, String> {
    let items = container.get("Items")
        .and_then(|v| v.get("$values"))
        .and_then(|v| v.as_array());
    
    match items {
        Some(arr) => Ok(arr.iter().filter_map(import_item).collect()),
        None => Ok(Vec::new()),
    }
}

/// Import single item
fn import_item(data: &Value) -> Option<EditorSequenceItem> {
    let item_type = data.get("$type")?.as_str()?.to_string();
    let name = data.get("Name")
        .and_then(|v| v.as_str())
        .unwrap_or("Unknown")
        .to_string();
    
    // Extract category from type
    let category = extract_category(&item_type);
    
    // Check if container
    let is_container = item_type.contains("Container") 
        || item_type.contains("SmartExposure")
        || item_type.contains("InstructionSet");
    
    // Import nested items if container
    let items = if is_container {
        data.get("Items")
            .and_then(|v| v.get("$values"))
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(import_item).collect())
    } else {
        None
    };
    
    // Import conditions
    let conditions = data.get("Conditions")
        .and_then(|v| v.get("$values"))
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(import_condition).collect());
    
    // Import triggers
    let triggers = data.get("Triggers")
        .and_then(|v| v.get("$values"))
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(import_trigger).collect());
    
    // Extract data fields
    let mut item_data = HashMap::new();
    if let Some(obj) = data.as_object() {
        for (key, value) in obj {
            // Skip metadata fields
            if key.starts_with('$') || key == "Parent" || key == "Items" 
                || key == "Conditions" || key == "Triggers" || key == "Strategy"
                || key == "Name" || key == "IsExpanded"
            {
                continue;
            }
            // Convert PascalCase to camelCase
            let camel_key = to_camel_case(key);
            item_data.insert(camel_key, value.clone());
        }
    }
    
    Some(EditorSequenceItem {
        id: uuid::Uuid::new_v4().to_string(),
        item_type,
        name,
        category,
        icon: None,
        description: None,
        status: crate::models::SequenceEntityStatus::Created,
        is_expanded: data.get("IsExpanded").and_then(|v| v.as_bool()),
        data: item_data,
        items,
        conditions,
        triggers,
    })
}

/// Import condition
fn import_condition(data: &Value) -> Option<EditorCondition> {
    let condition_type = data.get("$type")?.as_str()?.to_string();
    let name = data.get("Name")
        .and_then(|v| v.as_str())
        .unwrap_or("Unknown")
        .to_string();
    
    let category = extract_category(&condition_type);
    
    let mut condition_data = HashMap::new();
    if let Some(obj) = data.as_object() {
        for (key, value) in obj {
            if key.starts_with('$') || key == "Parent" || key == "Name" {
                continue;
            }
            let camel_key = to_camel_case(key);
            condition_data.insert(camel_key, value.clone());
        }
    }
    
    Some(EditorCondition {
        id: uuid::Uuid::new_v4().to_string(),
        condition_type,
        name,
        category,
        icon: None,
        data: condition_data,
    })
}

/// Import trigger
fn import_trigger(data: &Value) -> Option<EditorTrigger> {
    let trigger_type = data.get("$type")?.as_str()?.to_string();
    let name = data.get("Name")
        .and_then(|v| v.as_str())
        .unwrap_or("Unknown")
        .to_string();
    
    let category = extract_category(&trigger_type);
    
    let mut trigger_data = HashMap::new();
    if let Some(obj) = data.as_object() {
        for (key, value) in obj {
            if key.starts_with('$') || key == "Parent" || key == "Name" || key == "TriggerItems" {
                continue;
            }
            let camel_key = to_camel_case(key);
            trigger_data.insert(camel_key, value.clone());
        }
    }
    
    // Import trigger items
    let trigger_items = data.get("TriggerItems")
        .and_then(|v| v.get("$values"))
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(import_item).collect());
    
    Some(EditorTrigger {
        id: uuid::Uuid::new_v4().to_string(),
        trigger_type,
        name,
        category,
        icon: None,
        data: trigger_data,
        trigger_items,
    })
}

/// Extract category from NINA type string
fn extract_category(type_str: &str) -> String {
    // Extract from "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"
    let parts: Vec<&str> = type_str.split('.').collect();
    if parts.len() >= 4 {
        let category = parts[parts.len() - 2];
        if let Some(comma_pos) = category.find(',') {
            return category[..comma_pos].to_string();
        }
        return category.to_string();
    }
    "Unknown".to_string()
}

/// Convert PascalCase to camelCase
fn to_camel_case(s: &str) -> String {
    let mut result = String::new();
    let mut chars = s.chars();
    
    if let Some(first) = chars.next() {
        result.push(first.to_ascii_lowercase());
    }
    
    for c in chars {
        result.push(c);
    }
    
    result
}

/// Validate NINA JSON format
pub fn validate_nina_json(json_str: &str) -> Result<(), Vec<String>> {
    let data: Value = serde_json::from_str(json_str)
        .map_err(|e| vec![format!("Invalid JSON: {}", e)])?;
    
    let mut errors = Vec::new();
    
    // Check for $type field
    if data.get("$type").is_none() {
        errors.push("Missing $type field".to_string());
    } else {
        let type_str = data["$type"].as_str().unwrap_or("");
        if !type_str.contains("Container") {
            errors.push("Root element must be a container type".to_string());
        }
    }
    
    // Check for Items
    if let Some(items) = data.get("Items") {
        if items.get("$values").is_none() {
            errors.push("Items collection missing $values array".to_string());
        }
    }
    
    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::*;
    use std::collections::HashMap;

    fn create_test_sequence() -> EditorSequence {
        EditorSequence {
            id: "test".to_string(),
            title: "Test Sequence".to_string(),
            start_items: vec![
                EditorSequenceItem {
                    id: "start1".to_string(),
                    item_type: "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer".to_string(),
                    name: "Cool Camera".to_string(),
                    category: "Camera".to_string(),
                    icon: None,
                    description: None,
                    status: SequenceEntityStatus::Created,
                    is_expanded: None,
                    data: HashMap::new(),
                    items: None,
                    conditions: None,
                    triggers: None,
                },
            ],
            target_items: vec![],
            end_items: vec![],
            global_triggers: vec![],
        }
    }

    #[test]
    fn test_export_to_nina() {
        let sequence = create_test_sequence();
        let json = export_to_nina(&sequence).unwrap();
        
        assert!(json.contains("SequenceRootContainer"));
        assert!(json.contains("Test Sequence"));
        assert!(json.contains("CoolCamera"));
    }

    #[test]
    fn test_import_from_nina() {
        let nina_json = r#"{
            "$id": "1",
            "$type": "NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer",
            "Name": "Test",
            "SequenceTitle": "Test",
            "Items": {
                "$values": [
                    { "$type": "NINA.Sequencer.Container.StartAreaContainer, NINA.Sequencer", "Items": { "$values": [] }, "Conditions": { "$values": [] }, "Triggers": { "$values": [] } },
                    { "$type": "NINA.Sequencer.Container.TargetAreaContainer, NINA.Sequencer", "Items": { "$values": [] }, "Conditions": { "$values": [] }, "Triggers": { "$values": [] } },
                    { "$type": "NINA.Sequencer.Container.EndAreaContainer, NINA.Sequencer", "Items": { "$values": [] }, "Conditions": { "$values": [] }, "Triggers": { "$values": [] } }
                ]
            },
            "Conditions": { "$values": [] },
            "Triggers": { "$values": [] }
        }"#;
        
        let sequence = import_from_nina(nina_json).unwrap();
        assert_eq!(sequence.title, "Test");
    }

    #[test]
    fn test_roundtrip() {
        let original = create_test_sequence();
        let json = export_to_nina(&original).unwrap();
        let imported = import_from_nina(&json).unwrap();
        
        assert_eq!(imported.title, original.title);
        assert_eq!(imported.start_items.len(), original.start_items.len());
    }

    #[test]
    fn test_validate_nina_json_valid() {
        let json = r#"{ "$type": "NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer", "Items": { "$values": [] } }"#;
        assert!(validate_nina_json(json).is_ok());
    }

    #[test]
    fn test_validate_nina_json_missing_type() {
        let json = r#"{ "Items": [] }"#;
        assert!(validate_nina_json(json).is_err());
    }

    #[test]
    fn test_to_pascal_case() {
        assert_eq!(to_pascal_case("test"), "Test");
        assert_eq!(to_pascal_case("hello"), "Hello");
    }

    #[test]
    fn test_to_camel_case() {
        assert_eq!(to_camel_case("Test"), "test");
        assert_eq!(to_camel_case("Hello"), "hello");
    }
}
