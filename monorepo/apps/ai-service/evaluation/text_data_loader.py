"""
Text Data Loader Module

This module loads and manages text data for evaluation, including:
- OCR extracted text from images
- User descriptions
- Item labels and metadata
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from .evaluation_config import EvaluationConfig

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TextDataLoader:
    """Loads and manages text data for evaluation."""
    
    def __init__(self, config: EvaluationConfig = None):
        """
        Initialize text data loader.
        
        Args:
            config: Evaluation configuration
        """
        self.config = config or EvaluationConfig()
        self.test_images_dir = Path(self.config.test_images_dir)
        self.text_data = {}
        self._load_all_text_data()
    
    def _load_text_from_files(self) -> None:
        """Load text descriptions from .txt files alongside images."""
        logger.info("Loading text descriptions from .txt files...")
        
        if not self.test_images_dir.exists():
            logger.warning(f"Test images directory not found: {self.test_images_dir}")
            return
        
        txt_files = list(self.test_images_dir.glob("*.txt"))
        
        for txt_file in txt_files:
            item_name = txt_file.stem
            try:
                with open(txt_file, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if item_name not in self.text_data:
                        self.text_data[item_name] = {}
                    self.text_data[item_name]['description'] = content
                    logger.info(f"Loaded text for {item_name}: {content[:50]}...")
            except Exception as e:
                logger.error(f"Failed to load text from {txt_file}: {e}")
    
    def _load_text_from_json(self, json_file: Optional[Path] = None) -> None:
        """
        Load text data from JSON file.
        
        Args:
            json_file: Path to JSON file. If None, looks for test_data.json in test_images dir
        """
        if json_file is None:
            json_file = self.test_images_dir / "test_data.json"
        
        if not json_file.exists():
            logger.info(f"No JSON data file found at {json_file}")
            return
        
        logger.info(f"Loading text data from {json_file}...")
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                for item_name, item_data in data.items():
                    if item_name not in self.text_data:
                        self.text_data[item_name] = {}
                    
                    # Merge with existing data
                    if isinstance(item_data, dict):
                        self.text_data[item_name].update(item_data)
                    else:
                        self.text_data[item_name]['description'] = item_data
                    
                    logger.info(f"Loaded data for {item_name}")
        except Exception as e:
            logger.error(f"Failed to load JSON data: {e}")
    
    def _load_all_text_data(self) -> None:
        """Load text data from all available sources."""
        self._load_text_from_json()
        self._load_text_from_files()
        logger.info(f"Total items with text data: {len(self.text_data)}")
    
    def get_text_data(self, item_name: str) -> Dict[str, Any]:
        """
        Get text data for a specific item.
        
        Args:
            item_name: Name of the item (without extension)
            
        Returns:
            Dictionary containing text data for the item
        """
        return self.text_data.get(item_name, {})
    
    def get_all_text_data(self) -> Dict[str, Dict[str, Any]]:
        """Get all text data."""
        return self.text_data
    
    def get_description(self, item_name: str) -> str:
        """
        Get text description for an item.
        
        Args:
            item_name: Name of the item
            
        Returns:
            Description string, or empty string if not found
        """
        return self.text_data.get(item_name, {}).get('description', '')
    
    def get_label(self, item_name: str) -> str:
        """
        Get label/category for an item.
        
        Args:
            item_name: Name of the item
            
        Returns:
            Label string, or empty string if not found
        """
        return self.text_data.get(item_name, {}).get('label', '')
    
    def add_text_data(self, item_name: str, data: Dict[str, Any]) -> None:
        """
        Manually add text data for an item.
        
        Args:
            item_name: Name of the item
            data: Dictionary containing text data
        """
        if item_name not in self.text_data:
            self.text_data[item_name] = {}
        
        self.text_data[item_name].update(data)
        logger.info(f"Added/updated text data for {item_name}")
    
    def save_to_json(self, output_path: Optional[Path] = None) -> Path:
        """
        Save all text data to JSON file.
        
        Args:
            output_path: Path to save JSON file. If None, saves to test_images/test_data.json
            
        Returns:
            Path to saved file
        """
        if output_path is None:
            output_path = self.test_images_dir / "test_data.json"
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(self.text_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Text data saved to {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save text data: {e}")
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about loaded text data."""
        stats = {
            'total_items': len(self.text_data),
            'items_with_description': 0,
            'items_with_label': 0,
            'items': []
        }
        
        for item_name, item_data in self.text_data.items():
            has_desc = 'description' in item_data
            has_label = 'label' in item_data
            
            if has_desc:
                stats['items_with_description'] += 1
            if has_label:
                stats['items_with_label'] += 1
            
            stats['items'].append({
                'name': item_name,
                'has_description': has_desc,
                'has_label': has_label,
                'keys': list(item_data.keys())
            })
        
        return stats


def main():
    """Main entry point for text data loader."""
    print("Module: TextDataLoader")
    print("This module loads and manages text descriptions for evaluation.")
    print()
    print("Usage Instructions:")
    print("1. Create test_data.json in test_images folder:")
    print("   {")
    print("       'backpack_q': {'label': 'backpack', 'description': 'Lost silver backpack'},")
    print("       'backpack_t': {'label': 'backpack', 'description': 'Found brown backpack'},")
    print("       ...")
    print("   }")
    print()
    print("2. Or create .txt files alongside images:")
    print("   test_images/backpack_q.txt -> 'Lost silver backpack'")
    print()
    print("3. Use in evaluation:")
    print("   from evaluation.text_data_loader import TextDataLoader")
    print("   loader = TextDataLoader()")
    print("   description = loader.get_description('backpack_q')")
    print("   label = loader.get_label('backpack_q')")


if __name__ == "__main__":
    main()
